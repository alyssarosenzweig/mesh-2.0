mesh-2.0
========

Implements a mesh-like system for Scratch 2.0, using Scratch 2.0's extension feature and a node.js server.

Connecting to mesh
========

When the flag is clicked, the first thing you'll want to do is use one of the connect to mesh blocks.

The block "connect to public mesh" allows you to easily connect to the mesh server run by bobbybee. This is a service provided for your own benefit, so please don't abuse it :) If you have a high bandwidth application, read on.

The block "connect to mesh port" has fields for an IP address and port, which whoever sets up the mesh server will tell you the values for (see the section "Hosting mesh" for more information). This should be used if you have a complex game.

After a sucessful connection to the mesh servers, use the 'when connected to mesh' as the true beginning of the project.

Game name and version
========

After connecting, you need to set the game name and version. The game name should be a unique name of the project, and the version should be updated every time you update the project. This allows mesh to connect only to other people on your project, as opposed to some arbitrary project.

Match-making
========

Currently, once you connect to a mesh server using the connect block, your project is in a restricted state, where you can not properly use mesh. To get to a state where the broadcast and variable features are active, you must have a partner with whom you will play/use the project in question with. There are two mechanisms of doing this:

A) Named groups. One player will create a group with their name (typically their username), and the other player will use the join group block using the name the other player used to find and join the group. This allows two friends to play together, but requires that they communicated about playing through some other medium (such as comments on their Scratch profiles or Skype messages).

or B) "Any" groups. Using the "join any group" block, the server will match the player with the next available player who also uses the "join any group". Perfect if you just would like to play the game, and do not care who you will play the game with.

Once a second player is found, the "when group full" hat block will activate.

Using mesh
========

Once you are in a group, you can use the following blocks for communication:

- the "when I receive" and "broadcast" blocks, which are identical to the standard blocks, except they are broadcasted to the other Scratcher's computer
- the "set variable to value" and "value of variable" blocks which will allow you to share variables over the network (note: no variable creation is required)
- the "my player ID" block which will give you a unique number within your group (useful for determining who get's what avatar or who controls shared objects, for instance)

Advanced: Hosting mesh
========

At the time of writing (August 21, 2014) there is a public mesh server hosted by bobbybee. You can simply use the "connect to public mesh" to use it, and therefore ignore this section. However, if you have a complex application or game, you should follow these instructions to host your own server.

To host mesh, you will need node.js.

1) download and install node.js from the node.js website (http://nodejs.org). If you already have node, you can skip this step

2) download the server.js file from this repository and save it in an empty folder

3) cd into the folder with the server.js file

4) at your shell, enter

$ npm install

5) finally, to start the server from this directory, enter at your shell:

$ npm start

You will need to repeat steps 3 and 5 whenever you would like to start the mesh server.

On the Scratch side, the "connect to mesh server port" block should connect to your IP address and the port 4354. For making the mesh server publicly available, use your public IP address, port forwarding the port 4354. For playing over LAN (within your network), find your private IP address (typically 192.168.1.*) and connect using that from Scratch.
