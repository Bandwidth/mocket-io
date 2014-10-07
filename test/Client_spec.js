"use strict";
var Client = require("../lib/Client");
var expect = require("chai").expect;
var Server = require("../lib/Server");
var sinon  = require("sinon");

describe("A client", function () {
	it("requires a server", function () {
		var client;

		expect(function () {
			client = new Client();
		}).to.throw(/server is required/i);
	});

	describe("connecting", function () {
		var client;
		var createSocket;
		var server;
		var socket;

		before(function () {
			server = new Server();
			client = new Client(server);

			createSocket = sinon.spy(server, "createSocket");
			socket       = client.connect();
		});

		it("returns a client socket from the server", function () {
			expect(createSocket.callCount, "create socket").to.equal(1);
			expect(socket, "socket").to.equal(createSocket.returnValues[0]);
		});
	});
});
