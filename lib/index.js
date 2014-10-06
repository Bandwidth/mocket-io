"use strict";
var fs   = require("fs");
var path = require("path");

module.exports = fs.readdirSync(__dirname).reduce(
	function (modules, name) {
		if (name !== "index.js") {
			modules[path.basename(name, ".js")] = require("./" + name);
		}
		return modules;
	},
	{}
);
