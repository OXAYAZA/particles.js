const
	gulp        = require( 'gulp' ),
	browserSync = require( 'browser-sync' );

exports.default = function () {
	browserSync.init({
		server: {
			baseDir: `./dev/`,
			directory: false
		},
		port: 8000,
		open: false,
		notify: true,
		reloadDelay: 0,
		ghostMode: {
			clicks: false,
			forms: false,
			scroll: false
		}
	});

	gulp.watch( 'dev/**/*.*' ).on( 'change', function( path, stats ) {
		browserSync.reload( path );
	});
};
