Mocket.IO
=========
[![Build Status](https://travis-ci.org/inetCatapult/mocket-io.svg?branch=master)](https://travis-ci.org/inetCatapult/mocket-io)

A partial mock of Socket.IO for use with Incubator projects

##Usage

###Creating Client- and Server-side socket interfaces
    var mocket = require("mocket-io");

    var server = new mocket.Server();
    var client = new mocket.Client(server);

    var clientSocket;
    var serverSocket;
    
    server.once("connection", function (socket) {
        serverSocket = socket;
    });
    
    clientSocket = client.connect();

####More compact: client-only
    var mocket = require("mocket-io");

    var client = new mocket.Client(new mocket.Server());

    var clientSocket = client.connect();

###Subscribing to a message type
    anySocket.on("persistentEventType", callback);
    anySocket.once("oneTimeEventType", callback);

###Sending a message to the server
    serverSocket.on("messageType", function (message) { console.log(message); });
    clientSocket.emit("messageType", "message");

###Joining a room
    serverSocket.join("roomName");

###Sending a message to a room
    serverSocket.to("roomName").emit("messageType", "message");

###Unsubscribing a handler
    anySocket.off("eventType", oldHandler);

###Unsubscribing all handlers
    anySocket.off("eventType");