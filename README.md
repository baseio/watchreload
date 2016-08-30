# watchreload

a auto-reloading dev server that works the way I want:  

	var watchreload = require('watchreload');
	
	watchreload.run({
  		watch: ['partials/', 'content-source/'],
		proc: rebuild,
		port: 8181,
		root: 'build/'
	});

`watch` takes an array of directories to watch. Recursive. When something changes in those dirs,  
`proc` is called (, with the changed filename as argument).  
`port` is the http port on which you the files from  
`root` will be served, e.g. [http://localhost:8181/]()

The signature of a `proc`-able function is `(callback:Function, filename:String) => callback()`, e.g.  

	function rebuild(cb, filename){
		// do things, and then call cb when done
		cb();
	}

The magic is that when `proc` completes, all browsers connected to this server will reload!  

#### Details

`node-watch` watches the directories,  
`express` serves the static files,  
`connect-static-transform` injects a small script to all served html pages,  
`ws` runs a websocket server.  

The browsers loads the html, the client.js connects via websocket to ws, node-watch detects filesystem changes and broadcasts 'reload' to ws.clients, that results in a location.reload in client.js.

The amazing `reconnecting-websocket` makes things work even if the server is restarted.


