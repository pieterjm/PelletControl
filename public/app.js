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
	    document.getElementById("TEMPERATURE").innerHTML = msg['temperature'];
	    document.getElementById("OPERATING_MODE").innerHTML = msg['operatingmode'];
	    document.getElementById("MODE").innerHTML = msg['mode'];
	});	
    });
});