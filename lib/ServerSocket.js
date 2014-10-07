"use strict";
var ClientSocket = require("./ClientSocket");
var UUID         = require("node-uuid");

function ServerSocket (namespace) {
	var scope = null;

	this.adapter = namespace.adapter;
	this.id      = UUID.v4();
	this.nsp     = namespace;
	this.rooms   = [];

	this.emit = function () {
		var parameters = Array.prototype.slice.call(arguments);

		if (scope) {
			this.adapter.broadcast(
				{
					data : parameters
				},
				{
					except : [ this.id ],
					rooms  : [ scope ]
				}
			);
			scope = null;
		}
		else {
			this.local.apply(this, parameters);
		}
	};

	this.in = function (room) {
		scope = room;
		return this;
	};

	this.local = ServerSocket.prototype.emit;

	this.to = this.in;
}

ServerSocket.prototype = Object.create(ClientSocket.prototype);

ServerSocket.prototype.constructor = ServerSocket;

ServerSocket.prototype.disconnect = function () {
	this.emit("disconnect");
};

ServerSocket.prototype.join = function (name) {
	this.adapter.add(this.id, name);
	this.rooms.push(name);
};

ServerSocket.prototype.leave = function (name) {
	this.adapter.del(this.id, name);
	this.rooms.splice(this.rooms.indexOf(name), 1);
};

module.exports = ServerSocket;
