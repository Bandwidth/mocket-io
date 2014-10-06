"use strict";
var ClientSocket = require("../lib/ClientSocket");
var EventEmitter = require("events").EventEmitter;
var expect       = require("chai").expect;
var Namespace    = require("../lib/Namespace");
var Server       = require("../lib/Server");
var ServerSocket = require("../lib/ServerSocket");
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

	it("has a root namespace", function () {
		expect(server, "root namespace").to.have.property("sockets")
		.that.is.an.instanceOf(Namespace)
		.and.that.has.property("name", "/");
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
			expect(socket, "socket").to.be.an.instanceOf(ClientSocket);
		});

		it("emits a server socket", function () {
			expect(connection.callCount, "connection event").to.equal(1);
			expect(connection.firstCall.args[0], "socket").to.be.an.instanceOf(ServerSocket);
		});
	});

	describe("adding middleware", function () {
		var middleware = function () {};

		var use;

		before(function () {
			use = sinon.stub(server.sockets, "use");
			server.use(middleware);
		});

		after(function () {
			use.restore();
		});

		it("places it on the root namespace", function () {
			expect(use.callCount, "use").to.equal(1);
			expect(use.firstCall.args[0], "middleware").to.equal(middleware);
		});
	});
});
