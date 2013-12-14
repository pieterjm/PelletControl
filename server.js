var serialport = require("serialport");
var SerialPort = serialport.SerialPort; 
var events = require('events');
var eventEmitter = new events.EventEmitter();

var queue = [];

// 
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


// two event listeners for testing purposes 
eventEmitter.on('pelletkachel', function(data) {
    console.log("event1: " + data.operatingmode);
});
eventEmitter.on('pelletkachel', function(data) {
    console.log("event2: " + data.temperature);
});


setInterval(function(){
    console.log("timed event");
    queue.push("***i");    
},30000);