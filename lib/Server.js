"use strict";
var ClientSocket = require("./ClientSocket");
var EventEmitter = require("events").EventEmitter;
var ServerSocket = require("./ServerSocket");

function createBridge (socket1, socket2) {
	var emit1 = socket1.emit.bind(socket1);
	var emit2 = socket2.emit.bind(socket2);

	socket1.emit = emit2;
	socket2.emit = emit1;
}

function Server () {
	this.createSocket = function () {
		var clientSocket = new ClientSocket();
		var serverSocket = new ServerSocket();

		createBridge(clientSocket, serverSocket);

		this.emit("connection", serverSocket);
		return clientSocket;
	};
}

Server.prototype = Object.create(EventEmitter.prototype);

Server.prototype.constructor = Server;

module.exports = Server;
