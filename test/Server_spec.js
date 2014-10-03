"use strict";
var EventEmitter = require("events").EventEmitter;
var expect       = require("chai").expect;
var Server       = require("../lib/Server");
var sinon        = require("sinon");

describe("A Server", function () {
	var server;

	before(function () {
		server = new Server();
	});

	it("is an event emitter", function () {
		expect(server, "emitter").to.be.an.instanceOf(EventEmitter);
		expect(server, "constructor").to.have.property("constructor", Server);
	});

	describe("creating a client socket", function () {
		var connection;
		var socket;

		before(function () {
			connection = sinon.spy();
			server.once("connection", connection);

			socket = server.createSocket();
		});

		after(function () {
			server.removeListener("connection", connection);
		});

		it("returns a client socket", function () {
			// TODO: this should be fleshed out when the real class hierarchy is
			// in place.
			expect(socket, "socket").to.exist;
		});

		it("emits a server socket", function () {
			expect(connection.callCount, "connection event").to.equal(1);
			// TODO: this should be fleshed out to account for socket typing.
			expect(connection.firstCall.args[0], "socket").to.exist;
		});
	});
});
