console.log('watchreload client loaded');
var host = window.document.location.host.replace(/:.*/, '');
//var ws = new WebSocket('ws://' + host + ':8182');
var ws = new ReconnectingWebSocket('ws://' + host + ':8182');
ws.onmessage = function (event) {
	var msg = event.data;
	console.log('msg', msg);
	if( msg === 'reload' ){
		window.document.location.reload();
	}
};