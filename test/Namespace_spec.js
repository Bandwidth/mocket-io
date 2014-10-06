"use strict";
var Adapter      = require("../lib/Adapter");
var ClientSocket = require("../lib/ClientSocket");
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
		var run;
		var socket;

		before(function () {
			var client = new ClientSocket();

			run    = sinon.spy(namespace, "run");
			socket = namespace.add(client);
		});

		after(function () {
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
		before(function () {
			namespace.run(socket);
		});

		it("applies the middleware to new sockets in order", function () {
			expect(socket.data, "data").to.deep.equal([ "foo", "bar" ]);
		});
	});
});
