$(document).on("ready", function() {

	//Global Socket Instance
	var socket;

	//Conectar Event
    $("#conectar").click(function() {
    	
    	//Connect
    	socket = io.connect('http://localhost:3000');

    	//Connected
    	socket.on('connect', function() { 

    		//Send NickName
    		socket.emit("nick", $("#nick").val());

    		//Recibe Usuarios Conectados
			socket.on('nicks', function (nicks) {
				$("#usuarios").empty();
				for (var i = 0; i < nicks.length; i++) {
					$("#usuarios").append('<option value="' + nicks[i].idSocket + '">' + nicks[i].userName + '</option>');
		      	}
			});

			//Enviar Mensaje Publico al Server
		    $("#enviarMensajePublico").click(function() {
				socket.emit('eventoEnviarMensajePublico', $("#message").val());
			});

			//Enviar Mensaje Privado al Server
		    $("#enviarMensajePrivado").click(function() {
		    	var selectedUser = $('#usuarios :selected').val();
		    	socket.emit('eventoEnviarMensajePrivado', {
					message: $("#message").val(),
					idSocket: selectedUser
				});
			});

			//Recibe Mensaje del Server
			socket.on('respuestaServer', function (data) {
				$("#mensajes").append('<option>' + data + '</option>');
			});

			//Event Unload Page
			$(window).unload(function() {
				socket.emit("forceDisconnect");
			});
		});
    });
});