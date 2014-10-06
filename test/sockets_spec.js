"use strict";
var Client = require("../lib/Client");
var expect = require("chai").expect;
var fs     = require("fs");
var path   = require("path");
var Server = require("../lib/Server");
var sinon  = require("sinon");

describe("The top-level API", function () {
	var api = require("..");

	it("exposes all modules", function () {
		var keys = fs.readdirSync(path.join(__dirname, "..", "lib"))
		.filter(function (key) {
			return key !== "index.js";
		})
		.map(function (key) {
			return path.basename(key, ".js");
		});

		expect(api, "api").to.have.keys(keys);
	});
});

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

describe("A socket connection to a room", function () {
	var room = "room";

	var clientSocket1;
	var clientSocket2;
	var serverSocket1;
	var serverSocket2;

	before(function (done) {
		var server = new Server();
		var client = new Client(server);
		var count = 0;

		server.on("connection", function (socket) {
			if (count === 0) {
				serverSocket1 = socket;
				serverSocket1.join(room);
				count += 1;
			}
			else {
				serverSocket2 = socket;
				serverSocket2.join(room);
				done();
			}
		});

		clientSocket1 = client.connect();
		clientSocket2 = client.connect();
	});

	describe("sending a message", function () {
		var message = "A test message.";

		var handler;

		before(function () {
			handler = sinon.spy();
			clientSocket1.once("message", handler);

			serverSocket2.to(room).emit("message", message);
		});

		after(function () {
			clientSocket1.removeListener("message", handler);
		});

		it("recieves the message on the client", function () {
			expect(handler.callCount, "message event").to.equal(1);
			expect(handler.firstCall.args[0], "message").to.equal(message);
		});
	});
});
