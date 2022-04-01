var gulp = require('gulp');
var gutil = require('gutil')
var spawn = require('child_process').spawn;
var browserSync = require('browser-sync').create();

const render = (cb) => {
	var nodeProcess = spawn('node', ['debug.js'], { stdio: 'inherit' });
	nodeProcess.on('close', function (exitCode) {
		if (exitCode == 8) {
			gutil.log('Error detected, waiting for changes...');
		}
		cb();
	});
};

const reload = (cb) => {
	browserSync.reload('index.html');
	cb();
}

gulp.task('debug', function () {
	browserSync.init({
		notify: false,
		server: '.'
	});

	gulp.watch('index.html', reload);
	gulp.watch(['index.js', 'debug.js'], gulp.series(render, reload));
});
