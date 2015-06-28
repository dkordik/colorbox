var gulp = require('gulp');
var gutil = require('gutil')
var spawn = require('child_process').spawn;
var browserSync = require('browser-sync');

gulp.task('render', function () {
	var nodeProcess = spawn('node', ['debug.js'], { stdio: 'inherit' });
	nodeProcess.on('close', function (exitCode) {
		if (exitCode == 8) {
			gutil.log('Error detected, waiting for changes...');
		}
	});
});

gulp.task('debug', function () {
	browserSync({
		notify: false,
		server: true
	});

	gulp.watch('index.html', browserSync.reload);
	gulp.watch(["index.js", "debug.js"], ["render"]);
});
