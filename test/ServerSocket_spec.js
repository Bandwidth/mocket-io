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

	it("has a list of rooms", function () {
		expect(socket, "rooms").to.have.property("rooms").that.deep.equals([]);
	});

	it("has an ID", function () {
		expect(socket, "ID").to.have.property("id")
		.that.is.a("string")
		.and.has.length.greaterThan(0);
	});

	describe("joining a room", function () {
		var name = "a room";

		before(function () {
			socket.join(name);
		});

		it("adds the room to the list of rooms", function () {
			expect(socket.rooms, "rooms").to.contain(name);
		});

		describe("and then leaving the room", function () {
			before(function () {
				socket.leave(name);
			});

			it("removes the room from the list of rooms", function () {
				expect(socket.rooms, "rooms").not.to.contain(name);
			});
		});
	});
});
