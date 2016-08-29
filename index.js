/*

+ inject js at the bottom of all served files
- start a ws server
- connect to injected client script
- tell client to reload when the opts.proc completes

*/
const chalk   	= require('chalk');
const watch   	= require('node-watch');
const express 	= require('express');
const path 		= require('path');
const st 		= require('connect-static-transform');
const ws 		= require('ws').Server;

const wsport 	= 8182;
const wss 		= new ws({port:wsport});
wss.on('connection', function connection(ws) {
	console.log( chalk.blue('% watchreload: wss-clients: '+ wss.clients.length) );
	ws.on('message', function incoming(message) {
		console.log( chalk.blue('% watchreload: ws received message:'), message );
	});
	ws.send('connected ('+ wss.clients.length +')' );
});
wss.broadcast = function broadcast(message) {
	console.log( chalk.blue('% watchreload: reloading '+ wss.clients.length +' browsers'));
	wss.clients.forEach(function each(client) {
		client.send(message);
	});
};


module.exports.run = function( opts ){

	opts.wsport = wsport;

	watch( opts.watch, (filename) => {
		if( filename.indexOf('.DS_Store') > -1 ) return;
		console.log('UPDATE', filename);
		
		opts.proc( function(){
			console.log('DONE -> RELOAD CLIENT');
			wss.broadcast('reload');
		});
	});


	var injectClientScript = st({
		root: opts.root,
		match: /.+\.html/,
		transform: function (path, text, send) {
			console.log( chalk.blue('>') + ' /'+ path.split(opts.root)[1] );
			var response = text.replace('</body>', scriptUrl+'</body>');
			send(response, {'Content-Type': 'text/html'});
		}
	});

	//var scriptUrl = '<script type="text/javascript" src="/watchreload/client.js"></script>';
	var scriptUrl  = '<script type="text/javascript" src="/watchreload/reconnecting-websocket.js"></script>';
		scriptUrl += '<script type="text/javascript" src="/watchreload/client.js"></script>';
	
	

	var app = express();

	/// inject client.js to all html files
	app.use( injectClientScript );

	// static file server 
	app.use( '/', express.static( opts.root) );

	// and one more, that only serves the client.js script
	app.use( '/watchreload', express.static( __dirname) );
	
	app.listen(opts.port, function(err) {
    	if (err) throw err;

    	var str  = "---------------------------------------------------------\n";
    		str += "-- watchreload started on HTTP port:"+ chalk.green(opts.port) +", WS port:"+ chalk.green(opts.wsport) +" --\n";
    		str += "---------------------------------------------------------\n";
    		str += "starting initial process:";

    	console.log(str);

    	opts.proc();
	});
}
