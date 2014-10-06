"use strict";
var Adapter      = require("../lib/Adapter");
var ClientSocket = require("../lib/ClientSocket");
var expect       = require("chai").expect;
var Namespace    = require("../lib/Namespace");
var Server       = require("../lib/Server");
var ServerSocket = require("../lib/ServerSocket");

describe("A namespace", function () {
	var namespace;
	var server;

	before(function () {
		server    = new Server();
		namespace = new Namespace(server, "/");
	});

	it("has a name", function () {
		expect(namespace, "name").to.have.property("name", "/");
	});

	it("has a server", function () {
		expect(namespace, "server").to.have.property("server", server);
	});

	it("has a list of sockets", function () {
		expect(namespace, "sockets").to.have.property("sockets")
		.that.deep.equal([]);
	});

	it("has an adapter", function () {
		expect(namespace, "adapter").to.have.property("adapter")
		.that.is.an.instanceOf(Adapter);
	});

	describe("adding a client socket", function () {
		var socket;

		before(function () {
			var client = new ClientSocket();

			socket = namespace.add(client);
		});

		it("returns a server socket", function () {
			expect(socket, "server socket").to.be.an.instanceOf(ServerSocket);
		});

		it("augments the socket list", function () {
			expect(namespace.sockets, "socket list").to.include(socket);
		});

		describe("and then removing it", function () {
			before(function () {
				namespace.remove(socket);
			});

			it("reduces the socket list", function () {
				expect(namespace.sockets, "socket list").not.to.include(socket);
			});

			describe("again", function () {
				var sockets;

				before(function () {
					sockets = namespace.sockets.length;
					namespace.remove(socket);
				});

				it("does nothing", function () {
					expect(namespace.sockets, "length").to.have.length(sockets);
				});
			});
		});
	});
});
