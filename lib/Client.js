"use strict";

function Client (server) {
	if (!server) {
		throw new Error("A server is required.");
	}

	this.connect = function () {
		return server.createSocket();
	};
}

module.exports = Client;
