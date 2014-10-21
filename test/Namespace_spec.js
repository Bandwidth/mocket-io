"use strict";
var Adapter      = require("../lib/Adapter");
var ClientSocket = require("../lib/ClientSocket");
var EventEmitter = require("events").EventEmitter;
var expect       = require("chai").expect;
var Namespace    = require("../lib/Namespace");
var Server       = require("../lib/Server");
var ServerSocket = require("../lib/ServerSocket");
var sinon        = require("sinon");

describe("A namespace", function () {
	var namespace;
	var server;

	before(function () {
		server    = new Server();
		namespace = new Namespace(server, "/");
	});

	it("is an event emitter", function () {
		expect(namespace, "type").to.be.an.instanceOf(EventEmitter);
	});

	it("has a name", function () {
		expect(namespace, "name").to.have.property("name", "/");
	});

	it("has a server", function () {
		expect(namespace, "server").to.have.property("server", server);
	});

	it("has a list of sockets", function () {
		expect(namespace, "sockets").to.have.property("sockets")
		.that.deep.equals([]);
	});

	it("has an adapter", function () {
		expect(namespace, "adapter").to.have.property("adapter")
		.that.is.an.instanceOf(Adapter);
	});

	it("has a stack of middleware", function () {
		expect(namespace, "middleware").to.have.property("fns")
		.that.deep.equals([]);
	});

	describe("adding a client socket", function () {
		describe("without an error", function () {
			var connection;
			var run;
			var socket;

			before(function () {
				var client = new ClientSocket();

				connection = sinon.spy();
				namespace.once("connection", connection);

				run = sinon.stub(namespace, "run");
				run.callsArgWith(1, null);

				socket = namespace.add(client);
			});

			after(function () {
				namespace.removeListener("connection", connection);
				run.restore();
			});

			it("returns a server socket", function () {
				expect(socket, "server socket").to.be.an.instanceOf(ServerSocket);
			});

			it("augments the socket list", function () {
				expect(namespace.sockets, "socket list").to.include(socket);
			});

			it("runs the middleware on the socket", function () {
				expect(run.callCount, "run").to.equal(1);
			});

			it("emits a connection event", function () {
				expect(connection.callCount, "connection").to.equal(1);
				expect(connection.firstCall.args[0], "socket").to.equal(socket);
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

		describe("with an error", function () {
			var client     = new ClientSocket();
			var connection = sinon.spy();
			var error      = new Error("Simulated failure.");
			var failure    = sinon.spy();

			var run;
			var socket;

			before(function () {
				run = sinon.stub(namespace, "run");
				run.callsArgWith(1, error);

				namespace.once("connection", connection);

				client.once("error", failure);
				socket = namespace.add(client);
			});

			after(function () {
				client.removeListener("error", failure);
				namespace.removeListener("connection", connection);
				run.restore();
			});

			it("returns a server socket", function () {
				expect(socket, "server socket").to.be.an.instanceOf(ServerSocket);
			});

			it("does not augment the socket list", function () {
				expect(namespace.sockets, "socket list").not.to.include(socket);
			});

			it("runs the middleware on the socket", function () {
				expect(run.callCount, "run").to.equal(1);
			});

			it("emits an error on the socket", function () {
				expect(failure.callCount, "failure").to.equal(1);
				expect(failure.firstCall.args[0], "message").to.equal(error.message);
			});

			it("does not emit a connection event", function () {
				expect(connection.callCount, "connection").to.equal(0);
			});
		});
	});
});

describe("A namespace configured with middleware", function () {
	var namespace;
	var socket;

	function middleware1 (socket, next) {
		socket.data = socket.data || [];
		socket.data.push("foo");
		next();
	}

	function middleware2 (socket, next) {
		socket.data = socket.data || [];
		socket.data.push("bar");
		next();
	}

	before(function () {
		namespace = new Namespace(new Server(), "/");
		namespace.use(middleware1);
		namespace.use(middleware2);

		socket = new ServerSocket(namespace);
	});

	it("has a list of middleware", function () {
		expect(namespace, "middleware").to.have.property("fns")
		.that.deep.equals([ middleware1, middleware2 ]);
	});

	describe("running the middleware", function () {
		var callback = sinon.spy();

		describe("without an error", function () {
			before(function () {
				namespace.run(socket, callback);
			});

			after(function () {
				delete socket.data;
				callback.reset();
			});

			it("applies the middleware to new sockets in order", function () {
				expect(socket.data, "data").to.deep.equal([ "foo", "bar" ]);
			});

			it("invokes the callback", function () {
				expect(callback.callCount, "callback").to.equal(1);
				expect(callback.firstCall.args[0], "arguments").to.be.null;
			});
		});

		describe("with an error", function () {
			var error = new Error("Simulated failure.");

			function failure (socket, next) {
				return next(error);
			}

			before(function () {
				namespace.fns.unshift(failure);
				namespace.run(socket, callback);
			});

			after(function () {
				// Remove the failure middleware.
				namespace.fns.shift();
				callback.reset();
			});

			it("calls back with an error", function () {
				expect(callback.callCount, "callback").to.equal(1);
				expect(callback.firstCall.args[0], "arguments").to.equal(error);
			});

			it("does not run any subsequent middleware", function () {
				expect(socket, "data").not.to.have.property("data");
			});
		});
	});
});
