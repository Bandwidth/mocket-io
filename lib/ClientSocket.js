"use strict";
var EventEmitter = require("events").EventEmitter;

function ClientSocket () {
}

ClientSocket.prototype = Object.create(EventEmitter.prototype);

ClientSocket.prototype.constructor = ClientSocket;

ClientSocket.prototype.off = function (event, listener) {
	if (listener) {
		return ClientSocket.prototype.removeListener.call(this, event, listener);
	}
	return ClientSocket.prototype.removeAllListeners.call(this, event);
};

module.exports = ClientSocket;
