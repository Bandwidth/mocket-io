"use strict";
// Provides a mock API for testing with Socket.io.
var rooms;
var io = {};
var middleware = [];

/*io.configure = function () {
	// Do nothing.
};*/

function addToRoom (socket, roomName) {
	var room = rooms[roomName];

	if (!room) {
		room = rooms[roomName] = [];
	}

	room.push(socket);
}

function removeFromRoom (socket, roomName) {
	var room = rooms[roomName];

	if (room && room.indexOf(socket) !== -1) {
		room.splice(room.indexOf(socket), 1);
	}
}

function getRoom (roomName) {
	return rooms[roomName];
}

function EventEmitter () {
	var listeners = {};
	var self = this;

	this.emit = function (event, payload) {
		var handlers = listeners[event] || [];

		handlers.forEach(function (handler) {
			handler(payload);
		});
	};

	this.on = function (event, handler) {
		var handlers = listeners[event] || [];

		if (!listeners[event]) {
			listeners[event] = handlers;
		}

		handlers.push(handler);
	};

	this.once = function (event, handler) {
		self.on(event, function (payload) { handler(payload); self.off(event, handler); });
	};

	this.off = function (event, handler) {
		if (handler === undefined) {
			delete listeners[event];
		}
		else {
			var handlers = listeners[event];
			if (handlers && handlers.indexOf(handler)) {
				handlers.splice(handlers.indexOf(handler), 1);
			}
		}
	};
}

function Socket () {
	var emit;
	var self = this;
	self.rooms = [];
	self.name = "Unnamed Socket";
	EventEmitter.call(this);

	this.to =
	this.in = function (roomName) {
		this.sendToRoom = roomName;
		return this;
	};

	emit = this.emit;
	this.emit = function (event, payload) {
		if (this.sendToRoom) {
			var sendToRoomCopy = this.sendToRoom;
			delete this.sendToRoom; //reset sendToRoom
			getRoom(sendToRoomCopy).forEach(function (socket) {
				socket.emit.apply(socket, [ event, payload ]);
			});
		}
		else {
			emit.apply(this, [ event, payload ]);
		}
	};

	this.handshake = {};
	this.sockets = this;

	this.join = function (roomName) {
		addToRoom(this, roomName);
		self.rooms.push(roomName);
		return this;
	};

	this.leave = function (roomName) {
		removeFromRoom(this, roomName);
		if (self.rooms.indexOf(roomName) !== -1) {
			self.rooms.splice(self.rooms.indexOf(roomName), 1);
		}
		return this;
	};

	// These are API stubs needed to emulate the reconnect behavior.
	//this.connect = function () {};
	//this.disconnect = function () {};
	//this.reconnect = function () {};
	this.socket = this;

	io.sockets.push(this);
}

io.use = function (middlewareFunction) {
	middleware.push(middlewareFunction);
};

io.connect = function () {
	var socket = new Socket();
	var middlewareCopy = middleware.slice(0);
	function next() {
		var middlewareFunction = middlewareCopy.shift();
		if (middlewareFunction) {
			middlewareFunction(socket, next);
		}
	}
	next();
	return socket;
};

Socket.prototype = Object.create(EventEmitter.prototype);

EventEmitter.call(io);

io.reset = function () {
	rooms = {};
	io.sockets = [];
};

io.reset();

exports.MockSocket = Socket;
exports.io = io;