"use strict";
var Adapter      = require("./Adapter");
var EventEmitter = require("events").EventEmitter;
var ServerSocket = require("./ServerSocket");

function createBridge (client, server) {
	var clientEmit = server.local.bind(server);
	var serverEmit = client.emit.bind(client);

	client.emit  = clientEmit;
	server.local = serverEmit;
}

function Namespace (server, name) {
	EventEmitter.call(this);

	this.adapter = new Adapter(this);
	this.fns     = [];
	this.name    = name;
	this.server  = server;
	this.sockets = [];
}

Namespace.prototype             = Object.create(EventEmitter.prototype);
Namespace.prototype.constructor = Namespace;

Namespace.prototype.add = function (client) {
	var self   = this;
	var socket = new ServerSocket(this);

	this.run(socket, function (error) {
		if (error) {
			client.emit("error", error.message);
			return;
		}
		else {
			createBridge(client, socket);
			self.sockets.push(socket);
			self.emit("connection", socket);
			return;
		}
	});

	return socket;
};

Namespace.prototype.remove = function (socket) {
	var index = this.sockets.indexOf(socket);

	if (-1 !== index) {
		this.sockets.splice(index, 1);
	}
};

Namespace.prototype.run = function (socket, callback) {
	var middleware = this.fns.slice();

	(function next (error) {
		var fn = middleware.shift();

		if (error) {
			callback(error);
			return;
		}

		if (fn) {
			fn(socket, next);
			return;
		}
		else {
			callback(null);
			return;
		}
	})();
};

Namespace.prototype.use = function (middleware) {
	this.fns.push(middleware);
	return this;
};

module.exports = Namespace;
