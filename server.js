var serialport = require("serialport");
var SerialPort = serialport.SerialPort; 
var events = require('events');
var eventEmitter = new events.EventEmitter();
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);




// queue of messages to be sent to the pelletkachel
var queue = [];

// pas zonodig het seriele device en de baudrate aan
var serialPort = new SerialPort("/dev/ttyUSB0",{
    baudrate: 19200,
    parser: serialport.parsers.readline("\r")
});



serialPort.on("open", function () {
    console.log('open');
    serialPort.on('data', function(data) {
	var result = undefined;
	
	console.log("RECV: " + data);

	if ( /^at$/.test(data) ) {
	    serialPort.write("OK\r");
	    console.log("SEND: OK");
	} else if ( /^at\+cmgf=1$/.test(data) ) {
	    serialPort.write("OK\r");
	    console.log("SEND: OK");
	} else if ( /^at\+cmgd=\d+$/.test(data) ) {
	    serialPort.write("OK\r");
	    console.log("SEND: OK");
	} else if ( /^at\+csq$/.test(data) ) {
	    serialPort.write("+CSQ: 9,99\r");
	    console.log("SEND: +CSQ");
	} else if ( /^at\+cmgr=\d+$/.test(data) ) {
	    var msg = undefined;
	    if ( msg = queue.shift() ) {
		serialPort.write("+CMGR: \"REC READ\",\"0123456789\",,\"01/01/01,00:00:00+32\"\r"+ msg + "i\r\rOK\r");
		console.log("SEND: SMS " + msg);
	    } else {
		serialPort.write("+CMGR: 0,,0\rOK\r");
		console.log("SEND: +CMGR: 0");
	    }
	} else if ( result = data.match(/^oper\.mode\ ([^,]+),\ mode\ ([^,]+),\ temp\.actual\ (\d+)\ deg/) ) {
	    console.log("Operating mode: " + result[1]);
	    console.log("mode: " + result[2]);
	    console.log("temperature: " + result[3]);

	    // emit event
	    eventEmitter.emit('pelletkachel',{operatingmode: result[1], mode: result[2], temperature: result[3]});

	} else if ( /^at\+cmgs=\d+$/.test(data) ) {
	    serialPort.write("+CMGS: 1\rOK\r");
	    console.log("SEND: +CMGS OK");
	} else {
	    console.log("PROBLEM: Unexpected data: " + data);
	}
    });
});

eventEmitter.on('smscommand',function(data) {
    queue.push(data);    
});

setInterval(function(){
    console.log("timed event");
    eventEmitter.emit('smscommand',"***i");    
},15000);

// start webserver
app.use(express.static(__dirname + '/public'));
server.listen(8080);

// forward everything to the socket
io.sockets.on('connection', function (socket) {    
    eventEmitter.on('pelletkachel', function(data) {
	socket.emit('pelletkachel', data);
    });
});
