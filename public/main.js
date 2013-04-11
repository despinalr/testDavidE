$(document).on("ready", inicializarEventos);
var socket;

function inicializarEventos() {
	socket = io.connect('http://localhost:3000');
	socket.on('respuestaServer', function (data) {
		$("#mensajes").val(data);
	});
	
    var x;
    x = $("#enviarMensaje");
    x.click(presionParrafo);
}

function presionParrafo() {
	socket.emit('eventoEnviarMensaje', $("#message").val());
}

