"use strict";
var ClientSocket = require("../lib/ClientSocket");
var expect       = require("chai").expect;
var Namespace    = require("../lib/Namespace");
var Server       = require("../lib/Server");
var ServerSocket = require("../lib/ServerSocket");
var sinon        = require("sinon");

describe("A server socket", function () {
	var namespace;
	var socket;

	before(function () {
		namespace = new Namespace(new Server(), "/");
		socket    = new ServerSocket(namespace);
	});

	it("is a client socket", function () {
		expect(socket, "socket").to.be.an.instanceOf(ClientSocket);
		expect(socket, "constructor").to.have.property("constructor", ServerSocket);
	});

	it("has a list of rooms", function () {
		expect(socket, "rooms").to.have.property("rooms").that.deep.equals([]);
	});

	it("has an ID", function () {
		expect(socket, "ID").to.have.property("id")
		.that.is.a("string")
		.and.has.length.greaterThan(0);
	});

	it("has a namespace", function () {
		expect(socket, "namespace").to.have.property("nsp", namespace);
	});

	it("has an adapter", function () {
		expect(socket, "adapter").to.have.property("adapter", namespace.adapter);
	});

	it("mirrors 'to' and 'in'", function () {
		expect(socket.to, "mirror").to.equal(socket.in);
	});

	describe("joining a room", function () {
		var name = "a room";

		var add;

		before(function () {
			add = sinon.spy(namespace.adapter, "add");
			socket.join(name);
		});

		after(function () {
			add.restore();
		});

		it("adds the room to the list of rooms", function () {
			expect(socket.rooms, "rooms").to.contain(name);
		});

		it("updates the adapter", function () {
			expect(add.callCount, "add").to.equal(1);
			expect(add.firstCall.args[0], "socket").to.equal(socket.id);
			expect(add.firstCall.args[1], "room").to.equal(name);
		});

		describe("and then leaving the room", function () {
			var del;

			before(function () {
				del = sinon.spy(namespace.adapter, "del");
				socket.leave(name);
			});

			after(function () {
				del.restore();
			});

			it("removes the room from the list of rooms", function () {
				expect(socket.rooms, "rooms").not.to.contain(name);
			});

			it("updates the adapter", function () {
				expect(del.callCount, "del").to.equal(1);
				expect(del.firstCall.args[0], "socket").to.equal(socket.id);
				expect(del.firstCall.args[1], "room").to.equal(name);
			});
		});
	});

	describe("sending a message to a room", function () {
		var broadcast;
		var message;

		before(function () {
			broadcast = sinon.spy(namespace.adapter, "broadcast");
			message   = sinon.spy();

			socket.once("message", message);
			socket.to("room").emit("message", "hello");
		});

		after(function () {
			broadcast.restore();
			socket.removeListener("message", message);
		});

		it("does not send the message normally", function () {
			expect(message.callCount, "message event").to.equal(0);
		});

		it("broadcasts the message to all participants except itself", function () {
			expect(broadcast.callCount, "broadcast").to.equal(1);
			expect(broadcast.firstCall.args[0], "packet").to.deep.equal({
				data : [ "message", "hello" ]
			});
			expect(broadcast.firstCall.args[1], "options").to.deep.equal({
				except : [ socket.id ],
				rooms  : [ "room" ]
			});
		});

		describe("then sending a normal message", function () {
			before(function () {
				socket.emit("message", "goodbye");
			});

			it("does not broadcast the second message", function () {
				expect(broadcast.callCount, "broadcast").to.equal(1);
			});

			it("sends the message normally", function () {
				expect(message.callCount, "message event").to.equal(1);
			});
		});
	});
});
