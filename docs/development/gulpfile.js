//**** EDIT THIS URL ****//
// Use this URL to point to the directory where your PHP/HTML files are being served locally.
var URL = "localhost/bkdr-dev/docs";
//**** EDIT THIS URL ****//


//**** BUILD OPTION ****//
// By default, this is set for just creating basic HTML files. Change to true to set the default to PHP.
var usePHP = false;
//**** BUILD OPTION ****//


// Development File Structure
var MAIN_DIR = "../";
var DEV_TEMPLATES = "./jade/templates";
var DEV_TEMPLATES_JADE = DEV_TEMPLATES + "/**/*.jade";
var DEV_JADE = "./jade/**/*.jade";
var DEV_SASS = "./sass/**/*.scss";
var DEV_JS = "./js/**/*.js";
var DEV_JSX = "./jsx/**/*.jsx";
var DEV_JSX_APP = "./jsx/app.jsx";
var DEV_IMG = "./img/**/*.*";
var DEV_SVG = "./svgs/**/*.svg";

var PRO_CSS = MAIN_DIR + "assets/css";
var PRO_IMG = MAIN_DIR + "assets/img";
var PRO_JS = MAIN_DIR + "assets/js";
var PRO_SVG = MAIN_DIR + "assets/svgs";
var PRO_FONTS = MAIN_DIR + "assets/fonts";

var WATCH_FILES = [PRO_CSS,PRO_JS,DEV_JADE];


// Include gulp/gulp plugins
var gulp = require('gulp');
var notify = require('gulp-notify');
var browserSync = require('browser-sync').create();


// Sass Task
gulp.task('build-sass', function() {
	var gulpSass = require('gulp-sass');

	var sassOptions = {
		errLogToConsole: true,
		linefeed: 'lf', // 'lf'/'crlf'/'cr'/'lfcr'
		outputStyle: 'expanded', // 'nested','expanded','compact','compressed'
		sourceComments: false
	};

	return gulp.src(DEV_SASS)
		.pipe(gulpSass(sassOptions))
		.on("error", notify.onError({
			message: 'Error: <%= error.message %>'
		}))
		.pipe(browserSync.stream())
		.pipe(gulp.dest(PRO_CSS));
});


// Misc - This prevents any files from being missing when reviewing the site.
gulp.task('misc', function() {
	gulp.src(DEV_IMG)
		.pipe(gulp.dest(PRO_IMG));
	gulp.src(DEV_SVG)
		.pipe(gulp.dest(PRO_SVG));
	return buildFonts();
});


// Minify Images
gulp.task('build-images', function() {
	var imagemin = require('gulp-imagemin');
	var pngcrush = require('imagemin-pngcrush');
	var svgmin = require('gulp-svgmin');
	
		gulp.src(DEV_IMG)
			.pipe(imagemin({
					progressive: true,
					svgoPlugins: [{removeViewBox: false}],
					use: [pngcrush()]
			}))
			.pipe(gulp.dest(PRO_IMG));
	
		return gulp.src("./img/**/*.svg")
			.pipe(svgmin())
			.pipe(gulp.dest(PRO_IMG));
});


// JS Task
gulp.task('build-js', function() {
	var browserify = require('browserify');
	var babelify = require('babelify');
	var source = require('vinyl-source-stream');

  return browserify({
      entries: "./js/init.js",
      extensions: ['.js'],
      debug: true
    })
    .transform('babelify', {presets: ['es2015']})
    .bundle()
    .pipe(source('init.js'))
    .on("error", notify.onError({
      message: 'Error: <%= error.message %>'
    }))
    .pipe(browserSync.stream())
    .pipe(gulp.dest(PRO_JS));
});


// React Task
gulp.task('build-react', function() {
	var browserify = require('browserify');
	var babelify = require('babelify');
	var source = require('vinyl-source-stream');

	return browserify({
			entries: DEV_JSX_APP,
			extensions: ['.jsx'],
			debug: true
		})
		.transform('babelify', {presets: ['es2015', 'react']})
		.bundle()
		.pipe(source('app.js'))
		.on("error", notify.onError({
			message: 'Error: <%= error.message %>'
		}))
		.pipe(browserSync.stream())
		.pipe(gulp.dest(PRO_JS));
});


// Icon Font
var buildFonts = function() {
	var gulp = require('gulp');
  var iconfont = require('gulp-iconfont');
  var iconfontCss = require('gulp-iconfont-css');
  return gulp.src([DEV_SVG], {base: MAIN_DIR})
    .pipe(iconfontCss({
      fontName: 'icons',
      fontPath: '../fonts/',
      targetPath: './'
    }))
    .pipe(iconfont({
      fontName: 'icons'
    }))
    .pipe(gulp.dest(PRO_FONTS));
}
gulp.task('build-fonts', function(){
  return buildFonts();
});


// Templates Render Function
gulp.task('build-templates', function() {
	if (usePHP) {
		var jade = require('gulp-jade-php');
	} else {
		var jade = require('gulp-jade');
	}

	return gulp.src(DEV_TEMPLATES_JADE)
		.pipe(jade({
			pretty: true
		}))
		.pipe(gulp.dest(MAIN_DIR));
});


// Templates Watch
gulp.task('watch', function() {
	if (usePHP) {
		browserSync.init({
			proxy: URL
		});
	} else {
		browserSync.init({
			server: "./" + MAIN_DIR
		});
	}

	gulp.watch(DEV_JADE, ['build-templates']);
	gulp.watch(DEV_JS, ['build-js']);
	gulp.watch(DEV_JSX, ['build-react']);
	gulp.watch(DEV_SASS, ['build-sass']);
	gulp.watch(WATCH_FILES, browserSync.reload);
});


// Templates Watch
gulp.task('setForPHP', function() {
	usePHP = true;
});


// Tasks
gulp.task('build', ['misc', 'build-sass', 'build-js', 'build-react', 'build-images', 'build-templates']);
gulp.task('php', ['setForPHP', 'build', 'watch']);
gulp.task('default', ['build', 'watch']);