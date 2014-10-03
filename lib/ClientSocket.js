"use strict";
var EventEmitter = require("events").EventEmitter;

function ClientSocket () {
}

ClientSocket.prototype = Object.create(EventEmitter.prototype);

ClientSocket.prototype.constructor = ClientSocket;

module.exports = ClientSocket;
