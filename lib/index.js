"use strict";

module.exports = [ "Adapter", "Client", "ClientSocket", "Namespace", "Server", "ServerSocket" ].reduce(
	function (modules, name) {
		modules[name] = require("./" + name);
		return modules;
	},
	{}
);
