"use strict";
var ClientSocket = require("./ClientSocket");
var EventEmitter = require("events").EventEmitter;
var Namespace    = require("./Namespace");

function Server () {
	this.sockets = new Namespace(this, "/");

	this.sockets.on("connection", this.emit.bind(this, "connection"));

	this.createSocket = function () {
		var clientSocket = new ClientSocket();

		this.sockets.add(clientSocket);
		return clientSocket;
	};

	this.use = function () {
		this.sockets.use.apply(this.sockets, arguments);
	};
}

Server.prototype = Object.create(EventEmitter.prototype);

Server.prototype.constructor = Server;

module.exports = Server;
