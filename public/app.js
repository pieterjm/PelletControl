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
    });
});