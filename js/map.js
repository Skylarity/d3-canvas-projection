mapboxgl.accessToken = 'pk.eyJ1Ijoic2t5bGFyaXR5IiwiYSI6ImNpczI4ZHBmbzAwMzgyeWxrZmZnMGI5ZXYifQ.1-jGFvM11OgVgYkz3WvoNw'
var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/light-v9',
	center: [-106.6056, 35.0853],
	zoom: 11
})

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

var d3projection = getD3() // Why is this here?

var path = d3.geoPath() // Why is this here?

var data = turf.random('polygons', 10, {
	bbox: [-105, 34, -107, 36]
})

//***** Begin what would be in a d3.json call if you were using a json file
function render() {
	d3projection = getD3()
	path.projection(d3projection)

	ctx.clearRect(0, 0, width, height)

	ctx.fillStyle = 'rgba(42, 100, 255, 0.5)'
	ctx.strokeStyle = 'rgba(42, 42, 42, 0.75)'

	data.features.forEach(function(d) {
		var polygons = []
		d.geometry.coordinates.forEach(function(coords) {
			coordSet = []
			coords.forEach(function(coordPair) {
				coordSet.push(d3projection(coordPair))
			})
			polygons.push(coordSet)
		})
		// console.log(polygons)

		ctx.beginPath()
		polygons.forEach(function(coords) {
			// console.log(coords)
			ctx.moveTo(coords[0][0], coords[0][1])
			coords.forEach(function(coord) {
				ctx.lineTo(coord[0], coord[1])
			})
		})
		// ctx.arc(coords[0], coords[1], 6, 0, Math.PI * 2)
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
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
