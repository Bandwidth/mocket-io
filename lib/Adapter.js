"use strict";
var _ = require("lodash");

function Adapter (namespace) {
	this.nsp   = namespace;
	this.rooms = {};
}

Adapter.prototype.add = function (id, room) {
	this.rooms[room]     = this.rooms[room] || {};
	this.rooms[room][id] = true;
};

Adapter.prototype.broadcast = function (packet, options) {
	var rooms = _.map(
		options.rooms,
		function (room) {
			return this.rooms[room];
		},
		this
	);

	var sockets = _.reduce(
		rooms,
		function (sockets, room) {
			return _.assign(sockets, room);
		},
		{},
		this
	);

	this.nsp.sockets.forEach(function (socket) {
		if (sockets[socket.id] && -1 === options.except.indexOf(socket.id)) {
			socket.local.apply(socket, packet.data);
		}
	});
};

Adapter.prototype.del = function (id, room) {
	delete this.rooms[room][id];
	if (this.rooms.hasOwnProperty(room) && Object.keys(this.rooms[room]).length === 0) {
		delete this.rooms[room];
	}
};

module.exports = Adapter;
