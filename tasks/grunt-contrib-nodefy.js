module.exports = function(grunt) {
	'use strict';

	var path = require('path');
	var async = require('async');
	var util = require('./util.js');
	var nodefy = require('nodefy');
	var _ = grunt.utils._;


	grunt.registerTask('nodefy', 'Converts AMD modules to CommonJS modules', function() {
		var config = grunt.config.get(this.name);
		var done = this.async();

		config.include = util.expand(config.include);
		config.exclude = util.expand(config.exclude);
		var files = _.difference(config.include, config.exclude);

		util.loadConfig(grunt.config.get('requirejs'), function(err, rjsconfig) {
			grunt.log.writeln('Converting modules to node.js:');
			async.forEachSeries(files, function(file, callback) {
				nodefy.convert(file, function(err, result) {
					if (err) {
						grunt.log.write(file);
						grunt.log.error();
						grunt.log.verbose(err);
						return;
					}

					var dest = path.resolve(config.dest, util.fileToModuleName(file, rjsconfig));
					grunt.log.writeln(file + ' -> ' + path.relative(process.cwd(), dest));
					grunt.file.write(dest, result, 'utf-8');
					callback(null);
				});
			}, function() {
				done();
			});
		});
	});

};
