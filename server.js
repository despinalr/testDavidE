var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io').listen(server);
var swig    = require('swig');
var cons    = require('consolidate');

var connectedSockets = [];
var users = [];

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

io.sockets.on('connection', function (socket) {

	//Registra Sockets
	connectedSockets[socket.id] = {};
	connectedSockets[socket.id].socket = socket;

	//Envia Todos los Usuarios Conectados
	socket.emit('nicks', connectedSockets);

	//Mensaje Público: Recibe Mensaje del Cliente y lo Envia a todos los Sockets
	socket.on('eventoEnviarMensajePublico', function (data) {
		io.sockets.emit('respuestaServer', data);
	});

	//Mensaje Privado: Recibe Mensaje del Cliente y lo Envia a un Socket Destino
	socket.on('eventoEnviarMensajePrivado', function (data) {
		connectedSockets[data.idSocket].socket.emit('respuestaServer', data.message);
		socket.emit('respuestaServer', data.message);
	});

	//Recibe Conexión del Cliente
	socket.on('nick', function (user) {
		var newUser = { 
			userName: user, 
			idSocket : socket.id
		};
		users.push(newUser);
		io.sockets.emit('nicks', users);
	});

	//Disconnect
	socket.on('forceDisconnect', function() {
		socket.disconnect();
	});

	//Disconnect
	socket.on('disconnect', function(){
		delete connectedSockets[socket.id];
	});
});

server.listen(3000);