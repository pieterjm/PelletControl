var serialport = require("serialport");
var SerialPort = serialport.SerialPort; 
var events = require('events');
var eventEmitter = new events.EventEmitter();
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var posix = require('posix');

// open syslog
posix.openlog('pelletcontrol', { cons: true, ndelay: true, pid: true }, 'local0');
posix.syslog('info', 'pelletcontrol started');


var currentTemp = "--";
var currentOMode = "--";
var currentMode = "--";
var currentSetTemp = "--";

// queue of messages to be sent to the pelletkachel
var queue = [];
var lastmode = "unknown";

// pas zonodig het seriele device en de baudrate aan
var serialPort = new SerialPort("/dev/ttyUSB0",{
    baudrate: 19200,
    parser: serialport.parsers.readline("\r")
});

function log(msg) {
    posix.syslog('info', msg);
//    console.log(msg);
}


serialPort.on("open", function () {
    serialPort.on('data', function(data) {
	var result = undefined;
	
	log("RECV: " + data);

	if ( /^at$/.test(data) ) {
	    serialPort.write("OK\r");
	    log("SEND: OK");
	} else if ( /^at\+cmgf=1$/.test(data) ) {
	    serialPort.write("OK\r");
	    log("SEND: OK");
	} else if ( /^at\+cmgd=\d+$/.test(data) ) {
	    serialPort.write("OK\r");
	    log("SEND: OK");
	} else if ( /^at\+csq$/.test(data) ) {
	    serialPort.write("+CSQ: 9,99\r");
	    log("SEND: +CSQ");
	} else if ( /^at\+cmgr=\d+$/.test(data) ) {
	    var msg = undefined;
	    if ( msg = queue.shift() ) {
		serialPort.write("+CMGR: \"REC READ\",\"0123456789\",,\"01/01/01,00:00:00+32\"\r"+ msg + "i\r\rOK\r");
		log("SEND: SMS " + msg);
	    } else {
		serialPort.write("+CMGR: 0,,0\rOK\r");
		log("SEND: +CMGR: 0");
	    }
	} else if ( result = data.match(/^oper\.mode\ ([^,]+),\ mode\ ([^,]+),\ temp\.actual\ (\d+)\ deg/) ) {
	    currentOMode = result[1];
	    currentMode = result[2];
	    currentTemp = result[3];
	    eventEmitter.emit('pelletkachel',{operatingmode: result[1], mode: result[2], temperature: result[3]});
	    lastmode = result[2];	    
	} else if (result = data.match(/^oper\.mode\ (\S+)\ set\ temp\.set\ (\d+)\ degr\ set/) ) {
	    currentOMode = result[1];
	    currentSetTemp = result[2];
	    eventEmitter.emit('pelletkachel',{operatingmode: result[1], mode: lastmode, settemp: result[2]});
	} else if ( /^at\+cmgs=\d+$/.test(data) ) {
	    serialPort.write("+CMGS: 1\rOK\r");
	    log("SEND: +CMGS OK");
	} else {
	    log("PROBLEM: Unexpected data: " + data);
	}
    });
});

eventEmitter.on('smscommand',function(data) {
    queue.push(data);    
});

// interval status readout each 30 seconds
setInterval(function(){
    log("timed event. queuelength = " + queue.length);
    eventEmitter.emit('smscommand',"***i");    
},30000);

// start webserver for web control
app.use(express.static(__dirname + '/public'));
server.listen(8080);

function emitstate(socket) {
    socket.emit('pelletkachel', {operatingmode: currentOMode,mode: currentMode,temperature: currentTemp,settemp: currentSetTemp});
}

// forward everything to the socket
io.sockets.on('connection', function (socket) {    
    emitstate(socket);
    
    eventEmitter.on('pelletkachel', function(data) {
	emitstate(socket);
    });

    socket.on('settemp', function(data) {
	console.log("Settemp: " + data.temperature);
	var temp = Number(data.temperature).toFixed(0);
	if ( temp >= 10 && temp < 25 ) {
	    eventEmitter.emit('smscommand',"***baheat-rt" + temp + "#");
	    currentSetTemp = temp;
	}
    });

    socket.on('setmode', function(data) {
	console.log("Setmode: " + data.operatingmode);

	if ( data.operatingmode.toLowerCase() == 'off' ) {
	    eventEmitter.emit('smscommand',"***baoff#");
	} else if ( data.operatingmode.toLowerCase() == 'auto' ) {
	    eventEmitter.emit('smscommand',"***baauto");
	} else if ( data.operatingmode.toLowerCase() == 'heat' ) {
	    if ( Number(currentSetTemp) > 0 ) { 
		eventEmitter.emit('smscommand',"***baheat-rt" + currentSetTemp + "#");
	    } else if ( Number(currentTemp) > 0 ) { 
		eventEmitter.emit('smscommand',"***baheat-rt" + currentTemp + "#");
	    }
	}
    });
});



