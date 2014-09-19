"use strict";
// Provides a mock API for testing with Socket.io.
var rooms;
var io = {};

function getRoom (roomName) {
	var room = rooms[roomName];

	if (!room) {
		room = rooms[roomName] = [];
	}

	return room;
}

function addToRoom (socket, roomName) {
	getRoom(roomName).push(socket);
}

function removeFromRoom (socket, roomName) {
	var room = getRoom(roomName);
	var index = room.indexOf(socket);

	if (index !== -1) {
		room.splice(index, 1);
	}
}

function EventEmitter () {
	var listeners = {};
	var self = this;

	function getHandlers (event) {
		var handlers = listeners[event];

		if (!handlers) {
			handlers = listeners[event] = [];
		}

		return handlers;
	}

	this.emit = function (event, payload) {
		var handlers = getHandlers(event);

		handlers.forEach(function (handler) {
			handler(payload);
		});
	};

	this.on = function (event, handler) {
		getHandlers(event).push(handler);
	};

	this.once = function (event, handler) {
		self.on(
			event,
			function (payload) {
				handler(payload);
				self.off(event, handler);
			}
		);
	};

	this.off = function (event, handler) {
		if (handler === undefined) {
			delete listeners[event];
		}
		else {
			var handlers = getHandlers(event);
			var index = handlers.indexOf(handler);

			if (index !== -1) {
				handlers.splice(index, 1);
			}
		}
	};
}

function Socket () {
	var emit;
	var self = this;
	var sendToRoom;

	self.rooms = [];
	self.name = "Unnamed Socket";
	EventEmitter.call(this);

	this.handshake = {};
	this.socket = this;
	this.sockets = this;

	this.to =
	this.in = function (roomName) {
		sendToRoom = roomName;
		return this;
	};

	emit = this.emit;
	this.emit = function (event, payload) {
		if (sendToRoom) {
			getRoom(sendToRoom).forEach(function (socket) {
				socket.emit(event, payload);
			});
			//clear sendToRoom after sending one message to a room.
			//since the syntax of the "to" function is generally
			//  socket.to("roomName").emit("eventName", "message"),
			//we need to clear room state after actually emitting the message
			//in the chained function
			//NOTE: it's not completely clear if this is in line with Socket.IO,
			//if there are inconsistencies in room behavior, revisit this.
			sendToRoom = false;
		}
		else {
			emit.call(this, event, payload);
		}
	};

	this.join = function (roomName) {
		addToRoom(this, roomName);
		self.rooms.push(roomName);
		return this;
	};

	this.leave = function (roomName) {
		var index = self.rooms.indexOf(roomName);

		removeFromRoom(this, roomName);
		if (index !== -1) {
			self.rooms.splice(index, 1);
		}
		return this;
	};

	io.sockets.push(this);
}

Socket.prototype = Object.create(EventEmitter.prototype);

EventEmitter.call(io);

io.connect = function () {
	return new Socket();
};

io.reset = function () {
	rooms = {};
	io.sockets = [];
};

io.reset();

exports.MockSocket = Socket;
exports.io = io;
