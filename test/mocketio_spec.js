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
			var client;
			var handler;
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
			var client;
			var handler;
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
				expect(handler.called, "unsubbed").to.be.false;
				expect(handler2.called, "subbed").to.be.true;
			});
		});

		describe("which the client wasn't subscribed to previously", function () {
			it("should do nothing", function () {
				//silently doesn't change anything
				client = io.connect();
				client.off(eventName, handler);
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
			var clientA;
			var clientB;

			before(function (done) {
				clientA = io.connect();
				clientB = io.connect();
				clientA.join(roomName);
				clientB.join(roomName);
				done();
			});

			after(function () {
				clientA.leave(roomName);
				clientB.leave(roomName);
			});

			it("should show up in both client room lists", function () {
				expect(clientA.rooms, "client A").to.contain(roomName);
				expect(clientB.rooms, "client B").to.contain(roomName);
			});
		});
	});

	describe("leaving a room", function () {
		var roomName = "ROOM2";

		describe("which the client was in", function () {
			var client;

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
			it("should do nothing", function () {
				//expected behavior is: nothing happens
				//if it threw an error, it failed
				var client = io.connect();
				client.leave(roomName);
			});
		});
	});

	describe("sending a message", function () {
		var eventName = "TEST";

		//strictly speaking, in Socket.IO, there will
		//always be 'subscriber', but for our sniffing/mocking
		//purposes, there may not be
		describe("to a subscriber", function () {
			var client;
			var handler;
			var message = {};

			before(function (done) {
				client = io.connect();
				handler = sinon.spy(done.bind(null, null));
				client.once(eventName, handler);
				client.emit(eventName, message);
			});

			after(function () {
				client.off(eventName);
			});

			it("should call the handler once", function () {
				expect(handler.callCount, "called").to.equal(1);
				expect(handler.firstCall.args[0], "message").to.equal(message);
			});
		});

		describe("with no subscriber", function () {
			it("should do nothing", function () {
				//silently doesn't do anything
				var client = io.connect();
				client.emit(eventName, {});
			});
		});

		describe("to another room", function () {
			var clientA;
			var clientB;
			var clientC;
			var clientD;
			var handler;
			var roomName = "ROOM";
			var crossRoomEventName = "TEST2";
			var failSelfHandler;
			var failUnrelatedHandler;
			var handler2;
			var message = {};

			before(function (done) {
				failSelfHandler = sinon.spy();
				failUnrelatedHandler = sinon.spy();
				handler = sinon.spy();
				handler2 = sinon.spy();

				clientA = io.connect();
				clientB = io.connect(); //client B is in target room
				clientC = io.connect(); //client C is off in space, just to see what happens
				clientD = io.connect(); //a second client to add to the room, to test broadcast

				clientB.join(roomName);
				clientD.join(roomName);
				clientC.once(crossRoomEventName, failUnrelatedHandler);
				clientA.once(crossRoomEventName, failSelfHandler);
				clientB.once(crossRoomEventName, handler);
				clientD.once(crossRoomEventName, handler2);
				clientA.to(roomName).emit(crossRoomEventName, message);
				done();
			});

			after(function () {
				clientA.off(crossRoomEventName);
				clientB.off(crossRoomEventName);
				clientC.off(crossRoomEventName);
				clientB.leave(roomName);
			});

			it("should send the message to all clients in the other room", function () {
				expect(handler.callCount, "first client").to.equal(1);
				expect(handler.firstCall.args[0], "first message").to.equal(message);
				expect(handler2.callCount, "second client").to.equal(1);
				expect(handler2.firstCall.args[0], "second message").to.equal(message);
			});

			it("should not send a message to itself (not in room)", function () {
				expect(failSelfHandler.called, "self").to.be.false;
			});

			it("should not send a message to an unrelated third client", function () {
				expect(failUnrelatedHandler.called, "unrelated").to.be.false;
			});

			describe("and then sending a message to self (not the room)", function () {
				var eventName = "SELF-EVENT";
				var selfHandler;
				var failRoomHandler;

				before(function (done) {
					selfHandler = sinon.spy();
					failRoomHandler = sinon.spy();
					clientB.once(eventName, failRoomHandler);
					clientA.once(eventName, selfHandler);
					clientA.emit(eventName, message);
					done();
				});

				after(function () {
					clientA.off(eventName, selfHandler);
					clientB.off(eventName, failRoomHandler);
				});

				it("should get the message", function () {
					expect(selfHandler.callCount, "got message").to.equal(1);
				});

				it("should not send it to the room", function () {
					expect(failRoomHandler.called, "sent to room").to.be.false;
				});
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

	describe("running middleware which throws an error", function () {
		var client;
		var middlewareBSpy;

		before(function () {
			function middlewareA (socket, next) {
				next(new Error("error!"));
			}
			function middlewareB (socket, next) {
				socket.testPropertyB = "test";
				next();
			}
			middlewareBSpy = sinon.spy(middlewareB);
			io.use(middlewareA);
			io.use(middlewareB);
			client = io.connect();
		});

		it("should not reach the second middleware", function () {
			expect(middlewareBSpy.called, "called").to.be.false;
		});
	});

	describe("assigning socket options", function () {
		var client;
		var options = { foo : "bar" };

		before(function () {
			io.connect.configure(options);
			client = io.connect();
		});

		it("should assign the options to the socket", function () {
			expect(client).to.have.property("foo", "bar");
		});
	});
});
