module.exports = function(grunt) {

	'use strict';


	var path = require('path');
	var async = require('async');
	var amd = require('grunt-lib-amd');
	var nodefy = require('nodefy');


	grunt.registerMultiTask('nodefy', 'Converts AMD modules to CommonJS modules', function() {
		var done = this.async();
		var rjsconfig = amd.loadConfig(grunt.config.get('requirejs'));

		grunt.verbose.writeln('Loaded RequireJS config:');
		grunt.verbose.writeln(JSON.stringify(rjsconfig, false, 4));

		grunt.log.writeln('Converting modules to CommonJS format:');
		async.forEachSeries(this.files, function(files, callback) {
			var src = files.src.filter(function(filepath) {
				if (!grunt.file.exists(filepath)) {
					grunt.log.warn('Source file "' + filepath + '" not found.');
					return false;
				} else {
					return true;
				}
			});

			async.forEachSeries(src, function(file, callback) {

				nodefy.convert(file, function(err, result) {
					if (err) {
						grunt.log.write(src);
						grunt.log.error();
						grunt.log.verbose(err);
						return;
					}

					var dest = path.resolve(files.dest, amd.fileToModuleName(file, rjsconfig) + '.js');
					grunt.log.writeln(file + ' -> ' + path.relative(process.cwd(), dest));
					grunt.file.write(dest, result, 'utf-8');
					callback(null);
				});

			}, function() {
				callback(null);
			});

		}, function() {
			done();
		});
	});

};
