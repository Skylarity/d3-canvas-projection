mapboxgl.accessToken = 'pk.eyJ1Ijoic2t5bGFyaXR5IiwiYSI6ImNpczI4ZHBmbzAwMzgyeWxrZmZnMGI5ZXYifQ.1-jGFvM11OgVgYkz3WvoNw'
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/dark-v9',
	center: [-106.1, 34.5],
	zoom: 6
})
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();

var bbox = document.body.getBoundingClientRect()
var width = bbox.width
var height = bbox.height

var container = map.getCanvasContainer()

var canvas = d3.select(container).append('canvas').node()
canvas.width = width
canvas.height = height

var ctx = canvas.getContext('2d')

function getD3() {
	var bbox = document.body.getBoundingClientRect()
	var center = map.getCenter()
	var zoom = map.getZoom()

	var tileSize = 512
	var scale = tileSize * 0.5 / Math.PI * Math.pow(2, zoom) // magic
	var d3projection = d3.geoMercator()
		.center([center.lng, center.lat])
		.translate([bbox.width / 2, bbox.height / 2])
		.scale(scale)

	return d3projection
}

var d3projection = getD3()

var path = d3.geoPath()

var minHexSize = 1,
	maxHexSize = 6;

var colorScale = d3.scaleQuantile()
	.domain([minHexSize, maxHexSize])
	.range(["rgba(0,162,200, 0.5)", "rgba(0,71,182, 0.5)", "rgba(163,6,201, 0.5)", "rgba(219,10,108, 0.5)", "rgba(221,6,18, 0.5)"]);
var sizingScale = d3.scaleLinear()
	.domain([minHexSize, maxHexSize])
	.range([0.1, 1]);

var data = turf.hexGrid([-109, 37, -103, 32], 6, 'miles')

data.features.map(function(feature) {
	feature.properties = {
		size: (Math.random() * (maxHexSize - minHexSize)) + minHexSize,
		flooded: Math.random() > .9 ? true : false
	}

	feature.geometry = turf.transformScale(feature.geometry, sizingScale(feature.properties.size))

	return feature
})

// console.log(data)

//***** Begin what would be in a d3.json call if you were using a json file
function render() {
	d3projection = getD3()
	path.projection(d3projection)

	ctx.clearRect(0, 0, width, height)

	ctx.strokeStyle = 'rgba(255, 255, 255, .5)'
	ctx.lineWidth = 2

	data.features.forEach(function(d) {
		ctx.fillStyle = colorScale(d.properties.size)

		var polygons = []
        d.geometry.coordinates.forEach(function(coords) {
            coordSet = []
            coords.forEach(function(coordPair) {
                coordSet.push(d3projection(coordPair))
			})
			polygons.push(coordSet)
		})

		ctx.beginPath()
		polygons.forEach(function(coords) {
			// console.log(coords)
			ctx.moveTo(coords[0][0], coords[0][1])
			coords.forEach(function(coord) {
				// console.log(coord)
				ctx.lineTo(coord[0], coord[1])
			})
		})
		// ctx.arc(coords[0], coords[1], 6, 0, Math.PI * 2)
		ctx.closePath()
		ctx.fill()
		if (d.properties.flooded) {
			ctx.stroke()
		}
	})
}

map.on('viewreset', function() {
	render()
})
map.on('move', function() {
	render()
})

render()
//***** End the fictional d3.json call
