//**** EDIT THIS URL ****//
// Use this URL to point to the directory where your PHP/HTML files are being served locally.
var URL = "backdoor2.local/";
//**** EDIT THIS URL ****//


//**** BUILD OPTION ****//
// By default, this is set for just creating basic HTML files. Change to true to set the default to PHP.
var usePHP = false;
//**** BUILD OPTION ****//


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

var dev = false;


// Include gulp/gulp plugins
var gulp = require('gulp');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var phpMinify = require('@aquafadas/gulp-php-minify');


gulp.task('set-dev-node-env', function() {
	dev = true;
  return process.env.NODE_ENV = 'development';
});

gulp.task('set-prod-node-env', function() {
  return process.env.NODE_ENV = 'production';
});

// Sass Task
gulp.task('build-sass', function() {
	var gulpSass = require('gulp-sass');
	var bourbon = require('node-bourbon');

	var sassOptions = {
		errLogToConsole: true,
		linefeed: 'lf', // 'lf'/'crlf'/'cr'/'lfcr'
		outputStyle: 'compressed', // 'nested','expanded','compact','compressed'
		sourceComments: false,
		includePaths: bourbon.includePaths
	};

	return gulp.src(DEV_SASS)
		.pipe(gulpSass(sassOptions))
		.on("error", notify.onError({
			message: 'Error: <%= error.message %>'
		}))
		.pipe(browserSync.stream())
		.pipe(gulp.dest(PRO_CSS));
});


gulp.task('deploy-sass', function() {
	var sass = require('gulp-sass');
	var cssNano = require('gulp-cssnano');
	var bourbon = require('node-bourbon');
	var bless = require('gulp-bless');

	return gulp.src(DEV_SASS)
		.pipe(sass({
			errLogToConsole: true,
			outputStyle: 'compressed',
			sourceComments: false
		}))
		.on("error", notify.onError({
			message: 'Error: <%= error.message %>'
		}))
		.pipe(cssNano())
		// in order for bless to work correctly it needs to strip out comments before it parses the CSS
		.pipe(bless({
			cacheBuster: true,
			cleanup: true,
			compress: true
		}))
		.pipe(gulp.dest(PRO_CSS))
		.pipe(gulp.dest(REL_CSS));
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
		.pipe(gulp.dest(PRO_IMG))
		.pipe(gulp.dest(REL_IMG));

	return gulp.src(DEV_SVG)
		.pipe(svgmin())
		.pipe(gulp.dest(PRO_IMG))
		.pipe(gulp.dest(REL_IMG));
});


// JS Task
gulp.task('build-js', function() {
	// var browserify = require('browserify');
	// var babelify = require('babelify');
	// var source = require('vinyl-source-stream');

  // return browserify({
  //     entries: DEV_DIR + "/js/init.js",
  //     extensions: ['.js'],
  //     debug: true
  //   })
  //   .transform('babelify', {presets: ['es2015']})
  //   .bundle()
  //   .pipe(source('init.js'))
  //   .on("error", notify.onError({
  //     message: 'Error: <%= error.message %>'
  //   }))
  //   .pipe(browserSync.stream())
	// 	.pipe(gulp.dest(PRO_JS))
	// 	.pipe(gulp.dest(REL_JS));
});


// React Task
gulp.task('build-react', function(cb) {
	var browserify = require('browserify');
	var babelify = require('babelify');
	var source = require('vinyl-source-stream');
	var envify = require('gulp-envify');
	var pump = require('pump');
	var gConcat = require('gulp-concat');
	var bundle_name = 'bkdr.js';

	if (dev) {
		process.env.NODE_ENV = 'development';
		return browserify({
			entries: DEV_JSX_APP,
			extensions: ['.jsx'],
			debug: true
		})
		.transform('babelify', {presets: ['es2015', 'es2017', 'react']})
		.bundle()
		.pipe(source(bundle_name))
		.on("error", notify.onError({
			message: 'Error: <%= error.message %>'
		}))
		.pipe(browserSync.stream())
		.pipe(gulp.dest(PRO_JS));
	} else {
		process.env.NODE_ENV = 'production';
		return browserify({
			entries: DEV_JSX_APP,
			extensions: ['.jsx'],
			debug: true
		})
		.transform('babelify', {presets: ['es2015', 'es2017', 'react']})
		.bundle()
		.pipe(source(bundle_name))
		.pipe(buffer())
		.pipe(gConcat(bundle_name))
		.pipe(uglify({
			filename:bundle_name
		}))
		.on("error", notify.onError({
			message: 'Error: <%= error.message %>'
		}))
		.pipe(browserSync.stream())
		.pipe(gulp.dest(PRO_JS))
		.pipe(gulp.dest(REL_JS));
	}
});
 

// API task
gulp.task('build-api', function() {
	return gulp.src(DEV_PHP)
	.pipe(gulp.dest(PRO_PHP));
});

gulp.task('build-api-release', function() {
	return gulp.src(DEV_PHP, {
		read: false
	})
	.pipe(phpMinify())
	.pipe(gulp.dest(REL_PHP));
});

// API task
gulp.task('build-dirlister', function() {
	return gulp.src(DEV_DL)
	.pipe(gulp.dest(PRO_DL));
});

gulp.task('build-dirlister-release', function() {
	return gulp.src(DEV_DL, {
		read: false
	})
	.pipe(phpMinify())
	.pipe(gulp.dest(REL_DL));
});

// Templates Render Function
gulp.task('build-templates', function() {
	// if (usePHP) {
	// 	var jade = require('gulp-jade-php');
	// } else {
	// 	var jade = require('gulp-jade');
	// }

	// return gulp.src(DEV_TEMPLATES_JADE)
	// 	.pipe(jade({
	// 		pretty: true
	// 	}))
	// 	.pipe(gulp.dest(MAIN_DIR));
});


gulp.task('build-release', function() {
	gulp.src([MAIN_DIR + '/extensions/', '!./' + MAIN_DIR + '/extensions/**'])
	.pipe(gulp.dest(RELEASE_DIR));

	gulp.src([MAIN_DIR + '/term/'])
	.pipe(gulp.dest(RELEASE_DIR));
	gulp.src([MAIN_DIR + '/term/*.*'])
	.pipe(gulp.dest(RELEASE_DIR + '/term/'));

	gulp.src([MAIN_DIR + '/update/'])
	.pipe(gulp.dest(RELEASE_DIR));
	gulp.src([MAIN_DIR + '/update/*.*'])
	.pipe(gulp.dest(RELEASE_DIR + '/update/'));

	return gulp.src([MAIN_DIR + '/*.*', '!./' + MAIN_DIR + '/config.json', '!./' + MAIN_DIR + '/**/*.html'])
	.pipe(gulp.dest(RELEASE_DIR));
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

	gulp.watch(DEV_PHP, ['build-api']);
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
gulp.task('build', ['build-sass', 'build-js', 'build-react', 'build-images', 'build-api', 'build-dirlister', 'build-templates']);
gulp.task('deploy', ['deploy-sass', 'build-js', 'build-react', 'build-images', 'build-api-release', 'build-dirlister-release', 'build-release']);
gulp.task('release', ['set-prod-node-env', 'deploy']);
gulp.task('php', ['setForPHP', 'build', 'watch']);
gulp.task('dev', ['set-dev-node-env', 'build', 'watch']);
gulp.task('default', ['set-prod-node-env', 'build', 'watch']);