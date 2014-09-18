"use strict";

var _ =  require("lodash");

module.exports = function (grunt) {

	var sourceFiles = [ "*.js", "lib/**/*.js" ];
	var testFiles   = [ "test/**/*.js" ];
	var allFiles    = sourceFiles.concat(testFiles);

	var defaultJsHintOptions = grunt.file.readJSON("./.jshint.json");
	var testJsHintOptions = _.extend(
		grunt.file.readJSON("./test/.jshint.json"),
		defaultJsHintOptions
	);

	grunt.initConfig({
		jscs : {
			src     : allFiles,
			options : {
				config : ".jscsrc"
			}
		},

		jshint : {
			src     : sourceFiles,
			options : defaultJsHintOptions,
			test    : {
				options : testJsHintOptions,
				files   : {
					test : testFiles
				}
			}
		},

		/* jshint camelcase: false */
		mocha_istanbul : {
		/* jshint camelcase: true */
			coverage : {
				src     : "test",
				options : {
					check : {
						statements : 100,
						branches   : 100,
						lines      : 100,
						functions  : 100
					}
				}
			}
		},

		watch : {
			scripts : {
				files   : allFiles,
				tasks   : [ "lint", "style" ],
				options : {
					spawn : false,
				},
			},
		},

		clean : [ "coverage" ]
	});

	// Load plugins
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-mocha-istanbul");

	grunt.registerTask("test", [ "mocha_istanbul:coverage" ]);

	// Register tasks
	grunt.registerTask("lint", "Check for common code problems.", [ "jshint" ]);
	grunt.registerTask("style", "Check for style conformity.", [ "jscs" ]);
	grunt.registerTask("default", [ "clean", "lint", "style", "test" ]);

};