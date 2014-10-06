"use strict";

function Adapter () {
	this.rooms = {};
}

Adapter.prototype.add = function (id, room) {
	this.rooms[room]     = this.rooms[room] || {};
	this.rooms[room][id] = true;
};

Adapter.prototype.del = function (id, room) {
	delete this.rooms[room][id];
	if (this.rooms.hasOwnProperty(room) && Object.keys(this.rooms[room]).length === 0) {
		delete this.rooms[room];
	}
};

module.exports = Adapter;
