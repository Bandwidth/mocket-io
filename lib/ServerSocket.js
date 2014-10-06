"use strict";
var ClientSocket = require("./ClientSocket");
var UUID         = require("node-uuid");

function ServerSocket (namespace) {
	this.adapter = namespace.adapter;
	this.id      = UUID.v4();
	this.nsp     = namespace;
	this.rooms   = [];

	this.join = function (name) {
		this.adapter.add(this.id, name);
		this.rooms.push(name);
	};

	this.leave = function (name) {
		this.adapter.del(this.id, name);
		this.rooms.splice(this.rooms.indexOf(name), 1);
	};
}

ServerSocket.prototype = Object.create(ClientSocket.prototype);

ServerSocket.prototype.constructor = ServerSocket;

module.exports = ServerSocket;
