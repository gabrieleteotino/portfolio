var gulp = require('gulp');

var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

const gutil = require('gulp-util');
var ftp = require('vinyl-ftp');

var flatten = require('gulp-flatten');

var config = {
    "package-dir": "./node_modules"
}

// Default task
gulp.task('default', ['less', 'minify-css', 'minify-js', 'copy']);

// Compile the less files
gulp.task('less', function () {
    return gulp.src('less/creative.less')
        .pipe(less())
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify CSS
gulp.task('minify-css', function () {
    return gulp.src('css/creative.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function () {
    return gulp.src('src/creative.js')
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Copy Bootstrap core files from node_modules to vendor directory
gulp.task('bootstrap', function () {
    return gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('lib/bootstrap'))
});

// Copy jQuery core files from node_modules to vendor directory
gulp.task('jquery', function () {
    return gulp.src(['node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('lib/jquery'))
});

// Copy Magnific Popup core files from node_modules to vendor directory
gulp.task('magnific-popup', function () {
    return gulp.src(['node_modules/magnific-popup/dist/*.{min.js,css}'])
        .pipe(gulp.dest('lib/magnific-popup'))
});

// Copy ScrollReveal JS core JavaScript files from node_modules
gulp.task('scrollreveal', function () {
    return gulp.src(['node_modules/scrollreveal/dist/*.min.js'])
        .pipe(gulp.dest('lib/scrollreveal'))
});

// Copy Font Awesome core files from node_modules to vendor directory
gulp.task('fontawesome', function () {
    return gulp.src([
        'node_modules/font-awesome/**/*.{min.css,otf,eot,svg,ttf,woff,woff2}'
    ])
        // .pipe(flatten())
        .pipe(gulp.dest('lib/font-awesome'))
});

// Copy all dependencies from node_modules
gulp.task('copy', ['bootstrap', 'jquery', 'fontawesome', 'magnific-popup', 'scrollreveal']);

// Configure the browserSync task
gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: ''
        },
    })
});

// Watch Task that compiles LESS and watches for HTML or JS changes and reloads with browserSync
gulp.task('dev', ['browserSync', 'less', 'minify-css', 'minify-js'], function () {
    gulp.watch('less/*.less', ['less']);
    gulp.watch('css/*.css', ['minify-css']);
    gulp.watch('js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('js/**/*.js', browserSync.reload);
});

// Deploy
gulp.task('deploy', function () {
    const config = require('./ftp-config.json');

    var conn = ftp.create({
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port,
        parallel: 5,
        reload: true,
        debug: function (d) { console.log(d); },
        log: gutil.log
    });

    var globs = [
        'css/**',
        'img/**',
        'js/**',
        'lib/**',
        'index.html'
    ];

    return gulp.src(globs, { base: '.', buffer: false })
        .pipe(conn.newer('/htdocs/portfolio')) // only upload newer files
        .pipe(conn.dest('/htdocs/portfolio'));
});