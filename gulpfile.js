var gulp = require("gulp");
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var rename = require("gulp-rename");
var inject = require('gulp-inject');
var pug = require('gulp-pug');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var iife = require("gulp-iife");
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var spritesmith = require('gulp.spritesmith');

gulp.task('dist-pages', function() {
	return gulp.src('sources/views/pages/*.pug')
				 .pipe(pug({ pretty: true }))
				 .pipe(gulp.dest('dist/'))
})

gulp.task('dist-sass', ['dist-images'], function () {
	return gulp.src(['sources/scss/main.scss', 'sources/views/blocks/**/*.scss'])
					.pipe(plumber())
					.pipe(concat('build.scss'))
					.pipe(sass())
					.pipe(rename('build.css'))
					.pipe(autoprefixer({
						browsers: ['last 4 versions'],
						cascade: false
					}))
				 .pipe(gulp.dest('dist/css/'))
				 .pipe(browserSync.reload( {
						stream:true
				 }));
});

gulp.task('dist-inject', ['dist-pages', 'dist-sass'], function() {
	var sources = gulp.src(['dist/css/*.css'], {read: false});
	return gulp.src('dist/index.html')
	.pipe(inject(sources, {relative:true}))
	.pipe(gulp.dest('dist/'))
	.pipe(browserSync.reload( {
						stream:true
				 }));
})

gulp.task('dist-babel', function () {
	return gulp.src(['sources/js/*.js', 'sources/views/blocks/**/*.js'])
					.pipe(iife())
					.pipe(concat('build.js'))
					.pipe(babel({
						presets: ['es2015']
					}))
					.pipe(gulp.dest('dist/js/'));
});

gulp.task('dist-images', ['sprites'], function(){
	return gulp.src('sources/media/images/**/*.+(png|jpg|gif|svg)')
	.pipe(cache(imagemin({
		interlaced: true
	})))
	.pipe(gulp.dest('dist/images'))
});

gulp.task('sprites', function () {
  var spriteData = gulp.src('sources/media/sprites/**/*').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_sprite.scss',
    imgPath: '../images/sprite.png' 
  }));
  return spriteData.pipe(gulp.dest('sources/media/images'));
});

gulp.task('dist-fonts', function() {
	return gulp.src('sources/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))
})

gulp.task('cache:clear', function (callback) {
	return cache.clearAll(callback)
})

gulp.task('clean:dist', function() {
	return del.sync('dist')
});

gulp.task('watch', ['browserSync', 'dist-sass', 'dist-inject'], function () {
	gulp.watch(['sources/scss/main.scss', 'sources/scss/helpers/*.scss',
							'sources/views/blocks/**/*.scss'], ['dist-sass']);
	gulp.watch(['sources/views/pages/*.pug', 'sources/views/blocks/**/*.pug'], ['dist-inject']);
	gulp.watch(['sources/media/images/**/*'], ['dist-images'])

});

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'dist/'
		},
	})
})

gulp.task('default', function (callback) {
	runSequence('clean:dist', 
		['dist-pages', 'sprites', 'dist-images', 'dist-sass', 'dist-inject', 'dist-babel', 'dist-fonts', 'browserSync', 'watch'],
		callback
	)
});


