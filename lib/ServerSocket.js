"use strict";
var ClientSocket = require("./ClientSocket");

function ServerSocket () {
}

ServerSocket.prototype = Object.create(ClientSocket.prototype);

ServerSocket.prototype.constructor = ServerSocket;

module.exports = ServerSocket;
