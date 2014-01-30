var ellookup = {
    'operatingmode' : 'OPERATING_MODE',
    'temperature':  'TEMPERATURE',
    'mode': 'MODE',
    'settemp': 'SETTEMP'
};

require([
    "dojo/_base/connect",
    "dojo/_base/window",
    "dojo/dom-construct",
    "dojo/ready",
    "dijit/registry",
    "dojo/data/ItemFileReadStore",
    "dojox/mobile/ProgressIndicator",
    "dojox/mobile/ListItem",
    "dojox/mobile/ComboBox",
    "dojox/mobile/parser",
    "dojox/mobile",
    "dojox/mobile/Button",
    "dojox/mobile/SimpleDialog",
    "dojox/mobile/ValuePicker",
    "dojox/mobile/compat",
    "dojox/mobile/ScrollableView",
    "dojox/mobile/RoundRectDataList",
    "dojox/mobile/ContentPane"
], function(connect, win, domConstruct, ready, registry, ItemFileReadStore, ProgressIndicator, ListItem, parser){
    ready(function(){
	var socket = io.connect();
	socket.on("pelletkachel",function(msg) {	    
	    for (var key in msg ) {
		var el = document.getElementById(ellookup[key]);
		if ( el ) {		    
		    el.innerHTML = msg[key];
		}
	    }
	});	

	operatingmode_dialog = function(){
	    var node = registry.byId("pickermode");
	    var current = document.getElementById("OPERATING_MODE").innerHTML;
	    while ( node.value < current )
		node.spin(1);
	    registry.byId('dlg_operatingmode').show();
	}

	operatingmodeHide = function(dlg){
	    registry.byId('dlg_operatingmode').hide();
	}

	setOperatingmode = function() {
	    console.log("set mode");
	    var node = registry.byId("pickermode");
	    console.log(node.value);
	    socket.emit('setmode',{operatingmode:node.value});
	    registry.byId('dlg_operatingmode').hide();
	}

	settemp_dialog = function(){
	    var node = registry.byId("pickertemp");
	    var current = document.getElementById("TEMPERATURE").innerHTML;
	    while ( node.value < current )
		node.spin(1);
	    registry.byId('dlg_thermostat').show();
	}

	setThermostat = function() {
	    console.log("set thermostat");
	    var node = registry.byId("pickertemp");
	    console.log(node.value);
	    socket.emit('settemp',{temperature:node.value});
	    registry.byId('dlg_thermostat').hide();
	}

	thermostatHide = function(dlg){
	    registry.byId('dlg_thermostat').hide();
	}

    });
});