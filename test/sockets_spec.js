"use strict";
var Client = require("../lib/Client");
var expect = require("chai").expect;
var Server = require("../lib/Server");
var sinon  = require("sinon");

describe("A socket connection", function () {
	var clientSocket;
	var serverSocket;

	before(function (done) {
		var server = new Server();
		var client = new Client(server);

		server.once("connection", function (socket) {
			serverSocket = socket;
			done();
		});

		clientSocket = client.connect();
	});

	describe("sending a message from the client", function () {
		var message = "A test message.";

		var handler;

		before(function () {
			handler = sinon.spy();
			serverSocket.once("message", handler);

			clientSocket.emit("message", message);
		});

		after(function () {
			serverSocket.removeListener("message", handler);
		});

		it("receives the message on the server", function () {
			expect(handler.callCount, "message event").to.equal(1);
			expect(handler.firstCall.args[0], "message").to.equal(message);
		});
	});

	describe("sending a message from the server", function () {
		var message = "A test message.";

		var handler;

		before(function () {
			handler = sinon.spy();
			clientSocket.once("message", handler);

			serverSocket.emit("message", message);
		});

		after(function () {
			clientSocket.removeListener("message", handler);
		});

		it("recieves the message on the client", function () {
			expect(handler.callCount, "message event").to.equal(1);
			expect(handler.firstCall.args[0], "message").to.equal(message);
		});
	});
});