var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io').listen(server);
var swig    = require('swig');
var cons    = require('consolidate');

var users = {}

swig.init({
	cache : false
});

app.configure(function(){
	app.use(express.bodyParser());
	app.use( express.cookieParser() );
});

app.engine('.html', cons.swig);
app.set('view engine', 'html');
app.use(express.static('./public'));

app.get('/', function (req, res) {
	res.render('index', {
		titulo : 'Ejemplo'
	});
});

server.listen(3000);