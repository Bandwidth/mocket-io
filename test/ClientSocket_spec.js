"use strict";
var ClientSocket = require("../lib/ClientSocket");
var EventEmitter = require("events").EventEmitter;
var expect       = require("chai").expect;

describe("A client socket", function () {
	var socket;

	before(function () {
		socket = new ClientSocket();
	});

	it("is an event emitter", function () {
		expect(socket, "emitter").to.be.an.instanceOf(EventEmitter);
		expect(socket, "constructor").to.have.property("constructor", ClientSocket);
	});
});
