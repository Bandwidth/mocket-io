"use strict";
var Adapter      = require("../lib/Adapter");
var ClientSocket = require("../lib/ClientSocket");
var expect       = require("chai").expect;
var Namespace    = require("../lib/Namespace");
var Server       = require("../lib/Server");
var sinon        = require("sinon");
var UUID         = require("node-uuid");

describe("An adapter", function () {
	var adapter;
	var namespace;

	before(function () {
		namespace = new Namespace(new Server(), "/");
		adapter   = namespace.adapter = new Adapter(namespace);
	});

	it("has a hash of rooms", function () {
		expect(adapter, "rooms").to.have.property("rooms").that.deep.equal({});
	});

	it("has a namespace", function () {
		expect(adapter, "namespace").to.have.property("nsp", namespace);
	});

	describe("adding a socket to a new room", function () {
		var room     = "a room";
		var socketId = UUID.v4();

		before(function () {
			adapter.add(socketId, room);
		});

		it("creates a room entry", function () {
			expect(adapter.rooms, "room")
			.to.have.property(room)
			.that.has.property(socketId, true);
		});

		describe("and then removing the socket from the room", function () {
			before(function () {
				adapter.del(socketId, room);
			});

			it("destroys the room", function () {
				expect(adapter.rooms, "room").not.to.have.property(room);
			});
		});
	});

	describe("adding a socket to an existing room", function () {
		var room     = "another room";
		var firstId  = UUID.v4();
		var secondId = UUID.v4();

		before(function () {
			adapter.add(firstId, room);
			adapter.add(secondId, room);
		});

		after(function () {
			adapter.del(firstId, room);
		});

		it("adds a room entry", function () {
			expect(adapter.rooms[room], "socket").to.have.property(secondId, true);
		});

		describe("and then removing the socket from the room", function () {
			before(function () {
				adapter.del(secondId, room);
			});

			it("removes the room entry", function () {
				expect(adapter.rooms[room], "socket").not.to.have.property(secondId);
			});
		});
	});

	describe("broadcasting a message", function () {
		var handlers = [];
		var message  = "a test message";
		var room     = "foo";

		var clients;
		var servers;

		before(function () {
			clients = [ null, null, null, null ].map(function () {
				var client  = new ClientSocket();
				var handler = sinon.spy();

				client.once("message", handler);
				handlers.push(handler);
				return client;
			});

			servers = clients.map(function (client, index) {
				var socket = namespace.add(client);

				if (index < 3) {
					socket.join(room);
				}
				return socket;
			});

			adapter.broadcast(
				{
					data : [
						"message",
						message
					]
				},
				{
					rooms  : [ room ],
					except : servers[2].id
				}
			);
		});

		after(function () {
			servers.forEach(function (socket, index) {
				if (index < 3) {
					socket.leave(room);
				}
				namespace.remove(socket);
			});
		});

		it("does not send the message to sockets not in the room", function () {
			expect(handlers[3].callCount, "message").to.equal(0);
		});

		it("does not send the message to sockets on the ignore list", function () {
			expect(handlers[2].callCount, "message").to.equal(0);
		});

		it("sends the message to all matching sockets", function () {
			expect(handlers[0].callCount, "message event").to.equal(1);
			expect(handlers[0].firstCall.args[0], "message").to.equal(message);

			expect(handlers[1].callCount, "message event").to.equal(1);
			expect(handlers[1].firstCall.args[0], "message").to.equal(message);
		});
	});
});
