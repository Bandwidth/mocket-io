"use strict";
var EventEmitter = require("events").EventEmitter;

function Server () {
	this.createSocket = function () {
		// FIXME: create real sockets.
		var socket = Object.create(null);

		this.emit("connection", socket);
		return socket;
	};
}

Server.prototype = Object.create(EventEmitter.prototype);

Server.prototype.constructor = Server;

module.exports = Server;
