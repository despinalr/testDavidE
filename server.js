var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io').listen(server);
var swig    = require('swig');
var cons    = require('consolidate');

swig.init({
	cache : false
});

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'example', cookie: { maxAge: 1200000 } }));
	app.use(checkAuthentication);
	app.use(app.router);

	//Registra Contenido Estático y Vistas
	app.engine('.html', cons.swig);
	app.set('view engine', 'html');
	app.use(express.static('./public'));
});

require('./public/routes.js')(app);

//Verify Authentication
function checkAuthentication (req, res, next) {
	if (req.url !== '/login' && (!req.session || !req.session.authenticated)) {
		res.redirect('/login');
		return;
	}

	next();
}

io.sockets.on('connection', function (socket) {

	//Emite evento que alguien se conectó
	socket.emit('login');

	//Envia Todos los Usuarios Conectados
	socket.emit('nicks', getConnectedUsers());

	//Mensaje Público: Recibe Mensaje del Cliente y lo Envia a todos los Sockets
	socket.on('eventoEnviarMensajePublico', function (data) {
		io.sockets.emit('respuestaServer', data);
	});

	//Mensaje Privado: Recibe Mensaje del Cliente y lo Envia a un Socket Destino y al cliente que envia el mensaje
	socket.on('eventoEnviarMensajePrivado', function (data) {
		//Enviar al usuario destino
		getUserSocketByUserName(data.username, function(currentSocket) {
			currentSocket.emit('respuestaServer', data.message);
		});

		//Enviar al usuario que envia el mensaje
		socket.emit('respuestaServer', data.message);
	});

	//Set userName property to Socket
	socket.on('login', function (user) {
		socket.set('username', user, function(err) {
			socket.emit('respuestaServer', 'Ingresaste como: ' + user);
			socket.broadcast.emit('respuestaServer', 'Usuario ' + user + ' se conectó');

			//Emit all connected users
			io.sockets.emit('nicks',  getConnectedUsers());
		});
	});

	//Obtiene la lista de usuarios conectados
	socket.on('nicks', function (user) {
		io.sockets.emit('nicks',  getConnectedUsers());
	});

	//Force Disconnect
	socket.on('forceDisconnect', function() {
		socket.disconnect();
	});

	//Disconnect
	socket.on('disconnect', function() {
		//Obtiene el nombre del socket que se esta desconectando
		socket.get('username', function(err, username) {
			//Emite mensaje a todos que el socket se esta desconectando
			socket.broadcast.emit('respuestaServer', 'User ' + username + ' disconnected!!!');

			//Obtiene lista de los sockets que quedan disponibles sin tener en cuenta el socket actual
			getConnectedUsersExcludingUser(username, function(currentUsers) {
				//Emite usuarios conectados a todos los sockets disponibles
				io.sockets.emit('nicks', currentUsers);
			});
		});
	});

	function getConnectedUsers() {
		var currentUsers = [];
		io.sockets.clients().forEach(function (currentSocket) {
			currentSocket.get('username', function(err, username) {
		        currentUsers.push(username);
		    });
		});

		return currentUsers;
	}

	function getConnectedUsersExcludingUser(username, callback) {
		var currentUsers = [];
		io.sockets.clients().forEach(function (currentSocket) {
			currentSocket.get('username', function(err, currentusername) {
		        if(username != currentusername)
			     	currentUsers.push(currentusername);
		    });
		});

		callback(currentUsers);
	}

	function getUserSocketByUserName(username, callback) {
		var currentUserSocket;
		io.sockets.clients().forEach(function (currentSocket) {
			currentSocket.get('username', function(err, currentusername) {
				if(username == currentusername) {
					currentUserSocket = currentSocket;
				}
		    });
		});

		callback(currentUserSocket);
	}

});

server.listen(3000);