(function(ext) {
	ext.incomingBroadcasts = {};
	ext.vars = {};
	ext.partyFull = false;
	
	ext.playerID = 1;
	
	ext.version = "None";
	
	ext.acknowledgedConnection = false;
	ext.acknowledgedConnectionClosed = false;
	
	ext._shutdown = function() {
	
	};
	
	ext._getStatus = function() {
		return {status: 2, msg: 'Ready'};
	};
	
	ext.send = function(msg) {
		if(ext.isOpen) {
			ext.socket.send(JSON.stringify(msg));
		}
	}
	
	ext.connect = function(host, port, callback) {
		ext.socket = new WebSocket("ws://"+host+":"+port+"/", "mesh");
		ext.isOpen = false;
		
		ext.socket.onopen = function(e) {
			ext.isOpen = true;
			callback();
		}
		
		ext.socket.onmessage = function(e) {
			var message = JSON.parse(e.data);
			console.log(message);
			
			if(message.type == "broadcast") {
				ext.incomingBroadcasts[message.message] = true;
			} else if(message.type == "set") {
				ext.vars[message.varName] = message.value;
			} else if(message.type == "partyFull") {
				ext.partyFull = true;
				ext.playerID = message.playerID + 1;
			}
		}
		
		ext.socket.onclose = function(e) {
			console.log("Close "+e);
			ext.isOpen = false;
			ext.acknowledgedConnection = true; // just in case
			ext.acknowledgedConnectionClosed = false;
		}
		
		ext.socket.onerror = function(e) {
			console.log("Error "+e);
			ext.isOpen = false;
			ext.acknowledgedConnection = true; // just in case
			ext.acknowledgedConnectionClosed = false;
		}
	}
	
	ext.publicConnect = function(callback) {
		// this connects to a generic public mesh server
		// while it's hard-coded at the moment, 
		// in the future this should be something like mesh.scratch.mit.edu (I hope!)
		
		ext.connect("stormy-eyrie-8570.herokuapp.com", 80, callback);
	}
	
	ext.broadcast = function(message) {
		ext.send({
			type: "broadcast",
			message: message
		});
	}
	
	ext.whenIReceive = function(message) {
		if(ext.incomingBroadcasts[message]) {
			ext.incomingBroadcasts[message] = false;
			return true;
		} 
		
		return false;
	}
	
	ext.var = function(varName) {
		return ext.vars[varName] || "";
	}
	
	ext.setVar = function(varName, value) {
		ext.send({
			type: "set",
			varName: varName,
			value: value
		});
	}
	
	ext.partyCreate = function(name) {
		ext.send({
			type: "partyCreate",
			name: name,
			version: ext.version
		}); 
	}
	
	ext.partyJoin = function(name) {
		ext.send({
			type: "partyJoin",
			name: name,
			version: ext.version
		});
	}

	
	ext.partyJoinAny = function() {
		ext.send({
			type: "partyAny",
			version: ext.version
		});
	}
	
	ext.whenPartyFull = function() {
		if(ext.partyFull) {
			ext.partyFull = false;
			return true;
		}
		
		return false;
	}
	
	ext.getPlayerID = function() {
		return ext.playerID;
	}
	
	ext.setVersion = function(name, version) {
		ext.version = name+" "+version;
	}
	
	ext.whenConnectedToMesh = function() {
		if(!ext.acknowledgedConnection && ext.isOpen) {
			ext.acknowledgedConnection = true;
			return true;
		}
		
		return false;
	}
	
	ext.whenConnectionToMeshClosed = function() {
		if(!ext.acknowledgedConnectionClosed && ext.acknowledgedConnection) {
			ext.acknowledgedConnectionClosed = true;
			return true;
		}
		
		return false;
	}
	
	var descriptor = {
		blocks: [
			['w', 'connect to public mesh', 'publicConnect'],
			['w', 'connect to mesh server %s port %n', 'connect', 'localhost', 4354],
			['h', 'when connected to mesh', 'whenConnectedToMesh'],
			['h', 'when connection to mesh breaks', 'whenConnectionToMeshClosed'],
			
			['-'],
			
			[' ', 'set game name to %s and version to %s', 'setVersion', 'Tag', '0.0.1'],
			
			['-'],
			
			['h', 'when I receive %s', 'whenIReceive', 'message 1'],
			[' ', 'broadcast %s', 'broadcast', 'message 1'],
			
			['-'],
			
			[' ', 'set %s to %s', 'setVar', 'score', '10'],
			['r', 'value of %s', 'var', 'score'],
			
			['-'],
			
			['h', 'when group is full', 'whenPartyFull'],
			
			[' ', 'create group owned by %s', 'partyCreate', 'Scratch Cat'],
			[' ', 'join the group of %s', 'partyJoin', 'Scratch Cat'],
			
			['-'],			
						
			[' ', 'join any group', 'partyJoinAny'],
			
			['-'],
			
			['r', 'my player ID', 'getPlayerID']
		],
		url: "https://github.com/bobbybee/mesh-2.0/blob/master/ext.js"
	};
	
	ScratchExtensions.register('Mesh', descriptor, ext);
})({});