"use strict";
var Adapter = require("../lib/Adapter");
var expect  = require("chai").expect;
var UUID    = require("node-uuid");

describe("An adapter", function () {
	var adapter;

	before(function () {
		adapter = new Adapter();
	});

	it("has a hash of rooms", function () {
		expect(adapter, "rooms").to.have.property("rooms").that.deep.equal({});
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
});
