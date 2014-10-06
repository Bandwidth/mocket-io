"use strict";
var ClientSocket = require("../lib/ClientSocket");
var EventEmitter = require("events").EventEmitter;
var expect       = require("chai").expect;
var sinon        = require("sinon");

describe("A client socket", function () {
	var socket;

	before(function () {
		socket = new ClientSocket();
	});

	it("is an event emitter", function () {
		expect(socket, "emitter").to.be.an.instanceOf(EventEmitter);
		expect(socket, "constructor").to.have.property("constructor", ClientSocket);
	});

	describe("disabling a specific listener", function () {
		var handler = function () {};

		var removeListener;

		before(function () {
			removeListener = sinon.stub(ClientSocket.prototype, "removeListener");
			socket.off("event", handler);
		});

		after(function () {
			removeListener.restore();
		});

		it("removes the handler", function () {
			expect(removeListener.callCount, "remove").to.equal(1);
			expect(removeListener.firstCall.args[0], "event").to.equal("event");
			expect(removeListener.firstCall.args[1], "handler").to.equal(handler);
		});
	});

	describe("disabling an event", function () {
		var removeAll;

		before(function () {
			removeAll = sinon.stub(ClientSocket.prototype, "removeAllListeners");
			socket.off("event");
		});

		after(function () {
			removeAll.restore();
		});

		it("removes all handlers", function () {
			expect(removeAll.callCount, "remove").to.equal(1);
			expect(removeAll.firstCall.args[0], "event").to.equal("event");
		});
	});
});
