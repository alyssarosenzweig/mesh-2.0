var http = require('http');
var WebSocketServer = require('ws').Server;

var config = {
	port: process.argv[2] ? process.argv[2] : 4354
}

var wss = new WebSocketServer({
	port: config.port
});

var parties = [];
var partyAny = null;

wss.on('connection', function(ws) {
	console.log("Incoming connection..");
	
	var myParty = null;
	
	function routeMessage(msg, excluding) {
		// TODO: setup grouping
		
		var data = JSON.stringify(msg);
		
		for(var i = 0; i < myParty.participants.length; ++i)
			if(myParty.participants[i] != excluding)
				myParty.participants[i].send(data);
	}
	
	
	ws.on('message', function(message) {
		message = JSON.parse(message);
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
				myParty = { participants: [partyAny, ws] };
				partyAny.emit('match', myParty);
			} else {
				partyAny = ws; 
			}
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
})

http.createServer(function(req, res) {
	res.writeHead(200, {"Content-Type": "text/html"});
	
	res.end("<h1>Scratch Mesh 2.0</h1><div>If you can see this message, the Scratch Mesh 2.0 server is running correctly. However, we do not currently provide a web admin front panel! Sorry!");
}).listen(process.env.PORT || 5000);