"use strict";
var ClientSocket = require("../lib/ClientSocket");
var expect       = require("chai").expect;
var ServerSocket = require("../lib/ServerSocket");

describe("A server socket", function () {
	var socket;

	before(function () {
		socket = new ServerSocket();
	});

	it("is a client socket", function () {
		expect(socket, "socket").to.be.an.instanceOf(ClientSocket);
		expect(socket, "constructor").to.have.property("constructor", ServerSocket);
	});
});
