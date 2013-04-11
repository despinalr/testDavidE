var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io').listen(server);
var swig    = require('swig');
var cons    = require('consolidate');

var users = []

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

	//Envia Todos los Usuarios Conectados
	socket.emit('nicks', users);

	//Mensaje Público: Recibe Mensaje del Cliente y lo Envia a todos los Sockets
	socket.on('eventoEnviarMensajePublico', function (data) {
		/*socket.emit('respuestaServer', data);
		socket.broadcast.emit('respuestaServer', data);*/
		io.sockets.emit('respuestaServer', data);
	});

	//Mensaje Privado: Recibe Mensaje del Cliente y lo Envia a un Socket Destino
	socket.on('eventoEnviarMensajePrivado', function (data) {
		io.sockets.socket(data.idSocket).emit('respuestaServer', data.message);
		//io.sockets.socket(targetSocket[1]).broadcast.emit('respuestaServer', targetSocket[0]);
		/*io.sockets.clients().forEach(function (eachSocket) {
			if(eachSocket.store.id == targetSocket[1]) {
				eachSocket.emit('respuestaServer', targetSocket[0]);
			}
		});*/
	});

	
	//Recibe Conexión del Cliente
	socket.on('nick', function (user) {
		var newUser = { userName: user, idSocket : socket.id};
		users.push(newUser);
		socket.emit('nicks', users);
	});
});

server.listen(3000);