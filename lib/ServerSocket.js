"use strict";
var ClientSocket = require("./ClientSocket");
var UUID         = require("node-uuid");

function ServerSocket () {
	this.rooms = [];

	this.id = UUID.v4();

	this.join = function (name) {
		this.rooms.push(name);
	};

	this.leave = function (name) {
		this.rooms.splice(this.rooms.indexOf(name), 1);
	};
}

ServerSocket.prototype = Object.create(ClientSocket.prototype);

ServerSocket.prototype.constructor = ServerSocket;

module.exports = ServerSocket;
