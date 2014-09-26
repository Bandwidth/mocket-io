"use strict";
var expect = require("chai").expect;
var io     = require("./../lib/mocketio").io;
var sinon  = require("sinon");

describe("The Socket.IO mock", function () {
	describe("connecting a client", function () {
		var client;

		before(function (done) {
			client = io.connect();
			done();
		});

		it("should register the client to IO", function () {
			expect(io.sockets).to.contain(client);
		});
	});

	describe("subscribing to an event", function () {
		var client;
		var eventName = "EVENT";
		var handler;

		before(function (done) {
			client = io.connect();
			handler = sinon.spy(done.apply(null, null));
			client.on(eventName, handler);
			client.emit(eventName, {});
		});

		it("should receive a message for that event", function () {
			expect(handler.called, "message").to.be.true;
		});

		describe("...twice", function () {
			var handler2;

			before(function (done) {
				client = io.connect();
				handler = sinon.spy();
				handler2 = sinon.spy();
				client.on(eventName, handler);
				client.on(eventName, handler2);
				client.emit(eventName, {});
				done();
			});

			it("should get a callback on both handlers", function () {
				expect(handler.called, "first").to.be.true;
				expect(handler2.called, "second").to.be.true;
			});
		});
	});

	describe("unsubscribing from an event", function () {
		var client;
		var eventName = "EVENT";
		var handler;

		describe("which the client was subscribed to previously", function () {
			before(function (done) {
				client = io.connect();
				handler = sinon.spy();
				client.on(eventName, handler);
				client.off(eventName);
				client.emit(eventName, {});
				done();
			});

			it("should not receive a message", function () {
				expect(handler.called, "called").to.be.false;
			});
		});

		describe("for only one of two subscribed handlers", function () {
			var handler2;

			before(function (done) {
				client = io.connect();
				handler = sinon.spy();
				handler2 = sinon.spy();
				client.on(eventName, handler);
				client.on(eventName, handler2);
				client.off(eventName, handler); //unsub first handler
				client.emit(eventName, {});
				done();
			});

			it("should receive a message only on the subbed one", function () {
				//expect(handler.called, "unsubbed").to.be.false;
				expect(handler2.called, "subbed").to.be.true;
			});
		});

		describe("which the client wasn't subscribed to previously", function () {
			before(function (done) {
				client = io.connect();
				client.off(eventName, handler);
				done();
			});

			it("should do nothing", function () {
				//silently doesn't change anything
			});
		});
	});

	describe("joining a room", function () {
		var client;
		var roomName = "ROOM1";

		before(function (done) {
			client = io.connect();
			client.join(roomName);
			done();
		});

		after(function () {
			client.leave(roomName);
		});

		it("should show up in room list", function () {
			expect(client.rooms, "shows up").to.contain(roomName);
		});

		describe("with two clients", function () {
			var clientB;

			before(function (done) {
				client = io.connect();
				clientB = io.connect();
				client.join(roomName);
				clientB.join(roomName);
				done();
			});

			after(function () {
				client.leave(roomName);
				clientB.leave(roomName);
			});

			it("should show up in both client room lists", function () {
				expect(client.rooms, "client A").to.contain(roomName);
				expect(clientB.rooms, "client B").to.contain(roomName);
			});
		});
	});

	describe("leaving a room", function () {
		var client;
		var roomName = "ROOM2";
		describe("which the client was in", function () {
			before(function (done) {
				client = io.connect();
				client.join(roomName);
				client.leave(roomName);
				done();
			});

			it("should not show up in room list", function () {
				expect(client.rooms).to.not.contain(roomName);
			});

			describe("and sending a message to that room", function () {
				var eventName = "TEST";
				var failHandler;

				before(function (done) {
					failHandler = sinon.spy(done.apply(null, null));

					client.once(eventName, failHandler);
					client.to(roomName).emit(eventName, {});
					done();
				});

				it("should not receive the message", function () {
					expect(failHandler.called, "gets message").to.be.false;
				});
			});
		});

		describe("which the client was not in", function () {
			before(function (done) {
				client = io.connect();
				client.leave(roomName);
				done();
			});

			it("should do nothing", function () {
				//expected behavior is: nothing happens
				//if it threw an error, it failed
			});
		});
	});

	describe("sending a message", function () {
		var client;
		var handler;
		var eventName = "TEST";

		//strictly speaking, in Socket.IO, there will
		//always be 'subscriber', but for our sniffing/mocking
		//purposes, there may not be
		describe("to a subscriber", function () {
			before(function (done) {
				client = io.connect();
				handler = sinon.spy(done.bind(null, null));
				client.once(eventName, handler);
				client.emit(eventName, {});
			});

			after(function () {
				client.off(eventName);
			});

			it("should call the handler once", function () {
				expect(handler.callCount, "called").to.equal(1);
			});
		});

		describe("with no subscriber", function () {
			before(function (done) {
				client = io.connect();
				client.emit(eventName, {});
				done();
			});

			it("should do nothing", function () {
				//silently doesn't do anything
			});
		});

		describe("to another room", function () {
			var clientB;
			var clientC;
			var clientD;
			var roomName = "ROOM";
			var crossRoomEventName = "TEST2";
			var failSelfHandler;
			var failUnrelatedHandler;
			var handler2;

			before(function (done) {
				failSelfHandler = sinon.spy();
				failUnrelatedHandler = sinon.spy();
				handler = sinon.spy();
				handler2 = sinon.spy();

				clientB = io.connect(); //client B is in target room
				clientC = io.connect(); //client C is off in space, just to see what happens
				clientD = io.connect(); //a second client to add to the room, to test broadcast

				clientB.join(roomName);
				clientD.join(roomName);
				clientC.once(crossRoomEventName, failUnrelatedHandler);
				client.once(crossRoomEventName, failSelfHandler);
				clientB.once(crossRoomEventName, handler);
				clientD.once(crossRoomEventName, handler2);
				client.to(roomName).emit(crossRoomEventName, {});
				done();
			});

			after(function () {
				clientB.off(crossRoomEventName);
				client.off(crossRoomEventName);
				clientC.off(crossRoomEventName);
				clientB.leave(roomName);
			});

			it("should send the message to all clients in the other room", function () {
				expect(handler.callCount, "first client").to.equal(1);
				expect(handler2.callCount, "second client").to.equal(1);
			});

			it("should not send a message to itself (not in room)", function () {
				expect(failSelfHandler.called, "self").to.be.false;
			});

			it("should not send a message to an unrelated third client", function () {
				expect(failUnrelatedHandler.called, "unrelated").to.be.false;
			});
		});
	});

	describe("creating middleware", function () {
		var client;
		var propValue = "test value";

		before(function () {
			function middleware (socket, next) {
				socket.testProperty = propValue;
				next();
			}
			io.use(middleware);
			client = io.connect();
		});

		it("should modify the socket", function () {
			expect(client.testProperty, "test prop").to.equal(propValue);
		});

		describe("with two sockets", function () {
			var clientB;

			before(function () {
				clientB = io.connect();
			});

			it("should modify both sockets", function () {
				expect(clientB.testProperty, "test prop").to.equal(propValue);
			});
		});
	});

	describe("chaining middleware", function () {
		var client;
		var propValueA = "test value a";
		var propValueB = "test value b";

		before(function () {
			function middlewareA (socket, next) {
				socket.testPropertyA = propValueA;
				next();
			}
			function middlewareB (socket, next) {
				socket.testPropertyB = propValueB;
				next();
			}
			io.use(middlewareA);
			io.use(middlewareB);
			client = io.connect();
		});

		it("should modify the socket", function () {
			expect(client.testPropertyA, "test prop A").to.equal(propValueA);
			expect(client.testPropertyB, "test prop B").to.equal(propValueB);
		});
	});
});