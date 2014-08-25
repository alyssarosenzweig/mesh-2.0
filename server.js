var http = require('http');
var WebSocketServer = require('ws').Server;

var config = {
	port: process.env.PORT ? process.env.PORT : process.argv[2] ? process.argv[2] : 5000
}

var wss = new WebSocketServer({
	port: config.port
});

var parties = [];
var partyAny = null;

if(!process.env.COMMIT_HASH) {
	var child = require("child_process").exec("git rev-parse HEAD", function(err, stdout, stderr) {
		process.env.COMMIT_HASH = stdout.slice(0,-1);
	});
}

wss.on('connection', function(ws) {
	console.log("Incoming connection..");
	
	var myParty = null;
	
	function routeMessage(msg, excluding) {
		// TODO: setup grouping
		
		var data = JSON.stringify(msg);
		
		for(var i = 0; i < myParty.participants.length; ++i)
			if(myParty.participants[i] != excluding)
				try {
					myParty.participants[i].send(data);
				} catch(e) {
					console.log(e);
					try {
						myParty.participants[i].close();
					} catch(e) {
						console.log(e);
					}
				}
	}
	
	
	ws.on('message', function(message) {
		try {
			message = JSON.parse(message);
		} catch(e) {
			console.log(e);
			try {
				ws.close();
			} catch(e) {
				console.log(e);
				// they're gone
			}
		}
		console.log(message);
		
		if(message.type == "broadcast") {
			routeMessage({
				type: "broadcast",
				message: message.message
			}, ws);
		} else if(message.type == "set") {
			routeMessage({
				type: "set",
				varName: message.varName,
				value: message.value
			});
		} else if(message.type == "partyCreate") {
			if(!myParty) {
				var party = {
					name: message.name,
					participants: [ws]
				}
				
				myParty = party;
				parties.push(party);
			}
		} else if(message.type == "partyJoin") {
			if(!myParty) {
				for(var i = 0; i < parties.length; ++i) {
					if(parties[i].name == message.name) {
						parties[i].participants.push(ws);
						myParty = parties[i];
						parties.splice(i, 0);
						
						for(var i = 0; i < myParty.participants.length; ++i) {
							myParty.participants[i].send(JSON.stringify({
								type: "partyFull",
								playerID: i
							}))
						}
						break;
					}
				}
				// TODO: error handling
			}
		} else if(message.type == "partyAny") {
			if(partyAny) {
				console.log("There IS a party waiting. Matching now!");
				
				myParty = { participants: [partyAny, ws] };
				partyAny.emit('match', myParty);
			} else {
				console.log("Your the first!");
				
				partyAny = ws; 
			}
	 	} else if(message.type == "debug") {
	 		ws.send(JSON.stringify(
				{
					 type: "debug",
					 node_env: process.env.NODE_ENV || "debug",
					 commit_hash: process.env.COMMIT_HASH || "non-git"
				}
			));
	 	}
		
	});
	
	ws.on('match', function(party) {
		myParty = party;
		
		console.log(party);
		
		for(var i= 0; i < myParty.participants.length; ++i) {
			myParty.participants[i].send(JSON.stringify({
				type: "partyFull",
				playerID: i
			}))
		}

	})
});