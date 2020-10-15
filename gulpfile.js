// Development File Structure
var MAIN_DIR = "_preview";
var AST_DIR = MAIN_DIR + "/assets";
var DEV_DIR = "_development";
var RELEASE_DIR = "_public_releases/bkdr";
var RELEASE_AST_DIR = RELEASE_DIR + "/assets";

var DEV_PHP = DEV_DIR + "/api/**/*.php";
var DEV_DL = DEV_DIR + "/dir-lister/**/*.php";
var DEV_TEMPLATES = DEV_DIR + "/jade/templates";
var DEV_TEMPLATES_JADE = DEV_TEMPLATES + "/**/*.jade";
var DEV_JADE = DEV_DIR + "/jade/**/*.jade";
var DEV_SASS = DEV_DIR + "/sass/**/*.scss";
var DEV_JS = DEV_DIR + "/js/**/*.js";
var DEV_JSX = DEV_DIR + "/jsx/**/*.jsx";
var DEV_JSX_APP = DEV_DIR + "/jsx/app.jsx";
var DEV_IMG = DEV_DIR + "/img/**/*.*";
var DEV_SVG = DEV_DIR + "/svgs/**/*.svg";

var PRO_PHP = MAIN_DIR + "/api";
var PRO_DL = MAIN_DIR + "/dir-lister";
var PRO_CSS = AST_DIR + "/css";
var PRO_IMG = AST_DIR + "/img";
var PRO_JS = AST_DIR + "/js";
var PRO_SVG = AST_DIR + "/svgs";
var PRO_FONTS = AST_DIR + "/fonts";

var REL_PHP = RELEASE_DIR + "/api";
var REL_DL = RELEASE_DIR + "/dir-lister";
var REL_CSS = RELEASE_AST_DIR + "/css";
var REL_IMG = RELEASE_AST_DIR + "/img";
var REL_JS = RELEASE_AST_DIR + "/js";
var REL_SVG = RELEASE_AST_DIR + "/svgs";
var REL_FONTS = RELEASE_AST_DIR + "/fonts";

var WATCH_FILES = [PRO_CSS,PRO_JS,DEV_JADE];

// Include gulp/gulp plugins
var gulp = require('gulp');
var cedx = require('@cedx/gulp-php-minify');
var notify = require('gulp-notify');
var browserSync = require('browser-sync').create();
var buffer = require('vinyl-buffer');


gulp.task('set_to_dev', function(done) {
	process.env.NODE_ENV = 'development';
	done();
});
gulp.task('set_to_prod', function(done) {
	process.env.NODE_ENV = 'production';
	done();
});


gulp.task('build-sass', function() {
	var sass = require('gulp-sass');
	var concat = require('gulp-concat');

	var sassOptions = {
		errLogToConsole: true,
		linefeed: 'lf', // 'lf'/'crlf'/'cr'/'lfcr'
		outputStyle: 'expanded', // 'nested','expanded','compact','compressed'
		sourceComments: false,
		includePaths: []
	};

	return gulp.src(DEV_SASS)
		.pipe(sass(sassOptions))
		.on("error", notify.onError({
			message: 'Error: <%= error.message %>'
		}))
		.pipe(concat('main.css'))
		.pipe(browserSync.stream())
		.pipe(gulp.dest(PRO_CSS));
});


gulp.task('deploy-sass', function() {
	var sass = require('gulp-sass');
	var cssmin = require('gulp-cssmin');
	var concat = require('gulp-concat');

	var sassOptions = {
		errLogToConsole: true,
		outputStyle: 'compressed',
		sourceComments: false
	}

	return gulp.src(DEV_SASS)
		.pipe(sass(sassOptions))
		.pipe(concat('main.css'))
		.pipe(cssmin())
		.pipe(gulp.dest(REL_CSS));
});


// React Task
gulp.task('build-react', function() {
	var browserify = require('browserify');
	var source = require('vinyl-source-stream');
	var minifyJS = require('gulp-minify');
	var bundle_name = 'bkdr.js';

	return browserify({
		entries: DEV_JSX_APP,
		extensions: ['.jsx'],
		debug: false
	})
	.transform('babelify', {presets: ['es2015', 'react']})
	.bundle()
	.pipe(source(bundle_name))
	.pipe(buffer())
	.pipe(gulp.dest(PRO_JS))
	.pipe(minifyJS({
		ext:{
			src: '-uncomp.js',
			min: '.js'
		},
		compress: true
	}))
	.pipe(gulp.dest(REL_JS));
});


// API task
gulp.task('build-api', function() {
	return gulp.src(DEV_PHP)
	.pipe(gulp.dest(PRO_PHP));
});
gulp.task('build-dirlister', function() {
	return gulp.src(DEV_DL)
	.pipe(gulp.dest(PRO_DL));
});


gulp.task('compressPhp', async function() {
	gulp.src(DEV_PHP)
	.pipe(gulp.dest(REL_PHP));
	return gulp.src(DEV_DL)
	.pipe(gulp.dest(REL_DL));
	
	// The Cedx PHP Minify is currently not working
	/*
	gulp.src(DEV_PHP, {read: false})
	.pipe(cedx.phpMinify())
	.pipe(gulp.dest(REL_PHP));
	return gulp.src(DEV_DL, {read: false})
	.pipe(cedx.phpMinify())
	.pipe(gulp.dest(REL_DL));
	*/
});


gulp.task('build-release', async function(done) {
	gulp.src([MAIN_DIR + '/term/'])
	.pipe(gulp.dest(RELEASE_DIR));
	gulp.src([MAIN_DIR + '/term/*.*'])
	.pipe(gulp.dest(RELEASE_DIR + '/term/'));

	gulp.src([MAIN_DIR + '/update/'])
	.pipe(gulp.dest(RELEASE_DIR));
	gulp.src([MAIN_DIR + '/update/*.*'])
	.pipe(gulp.dest(RELEASE_DIR + '/update/'));
	
	gulp.src([MAIN_DIR + '/*.*', '!./' + MAIN_DIR + '/config.json', '!./' + MAIN_DIR + '/**/*.html'])
	.pipe(gulp.dest(RELEASE_DIR));
	
	done();
});


// Templates Watch
gulp.task('watch', function() {

	browserSync.init({
		server: "./" + MAIN_DIR
	});

	gulp.watch(DEV_PHP, gulp.series('build-api'));
	gulp.watch(DEV_JSX, gulp.series('build-react'));
	gulp.watch(DEV_SASS, gulp.series('build-sass'));
	gulp.watch(WATCH_FILES, browserSync.reload);
});


// Tasks
gulp.task('build', gulp.series(gulp.parallel('build-sass', 'build-react', 'build-api', 'build-dirlister')));
gulp.task('release', gulp.series(gulp.parallel('set_to_prod', 'deploy-sass', 'build-react', 'compressPhp', 'build-release')));
gulp.task('default', gulp.series(gulp.parallel('set_to_dev', 'build', 'watch')));