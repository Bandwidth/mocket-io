"use strict";
var ClientSocket = require("./ClientSocket");
var EventEmitter = require("events").EventEmitter;
var Namespace    = require("./Namespace");

function Server () {
	var namespace = new Namespace(this, "/");

	this.createSocket = function () {
		var clientSocket = new ClientSocket();
		var serverSocket = namespace.add(clientSocket);

		this.emit("connection", serverSocket);
		return clientSocket;
	};
}

Server.prototype = Object.create(EventEmitter.prototype);

Server.prototype.constructor = Server;

module.exports = Server;
