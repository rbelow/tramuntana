const gulp = require('gulp');
const less = require('gulp-less');
const browserSync = require('browser-sync').create();
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const merge = require('merge-stream');
//const imageResize = require('gulp-image-resize');
const jimpResize = require("gulp-jimp-resize");
const jimp = require('gulp-jimp');
//const {phpMinify} = require('@cedx/gulp-php-minify');
//var nunjucks = require('gulp-nunjucks-html');
const nunjucksRender = require('gulp-nunjucks-render');
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
    ' * Tramuntana Villas - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2017-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' */\n',
    ''
].join('');

// Minify HTML
gulp.task('minify', ['nunjucks'], function() {
  return gulp.src('dist/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

// Minify PHP
/*gulp.task('minify:php', () => gulp.src('src/*.php', {read: false})
  .pipe(phpMinify())
  .pipe(gulp.dest('dist'))
 );*/

// Nunjucks HTML
gulp.task('nunjucks', function () {
    return gulp.src('src/nunjucks/views/*.html')
        .pipe(nunjucksRender({
        path: ['src/nunjucks'] // String or Array
    }))
        .pipe(gulp.dest('dist'));
});

// Compile LESS files from /less into /css
gulp.task('less', function() {
    gulp.src('src/less/tramuntana.less')
        .pipe(less())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }))

    gulp.src('src/bootstrap/less/bootstrap.less')
        .pipe(less())
        .pipe(gulp.dest('dist/bootstrap/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function() {
    let firstPath = gulp.src('dist/css/tramuntana.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.reload({
            stream: true
        }))

    let secondPath = gulp.src('dist/bootstrap/css/bootstrap.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/bootstrap/css'))
        .pipe(browserSync.reload({
            stream: true
        }))

    return merge(firstPath, secondPath);
});

// Minify JS
// NOTE Concat Bootstrap JavaScript to dist.
gulp.task('minify-js', function() {
    gulp.src('src/js/tramuntana.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

/*gulp.task('jimp-resize', function() {
    return gulp.src('src/img/*.{png,jpg,bmp}')
        .pipe(jimp({
            sizes: [
                {"width": 1200}
            ]
        }))
        .pipe(gulp.dest('src/img/staging'));
});*/

gulp.task('images', function() {
    gulp.src('src/img/*.{png,jpg,bmp}')
        // resize images
        .pipe(jimpResize({
            sizes: [
                { "width": 1200 }
            ]
        }))
        // crop images
        .pipe(jimp({
            '': {
                crop: { x: 0, y: 50, width: 1200, height: 700 }
            }
        }))
        //.pipe(gulp.dest('src/img/staging'))
        // compress images
        .pipe(imagemin([
            imagemin.gifsicle(),
            imageminMozjpeg({
                quality: 90
            }),
            imagemin.optipng(),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest('dist/img'))
});

// Minify PNG, JPEG, GIF and SVG images.
// @link http://stackoverflow.com/questions/30947055/use-gulp-imagemin-with-imagemin-jpeg-recompress-plugin
// @link https://www.npmjs.com/package/imagemin-mozjpeg
/*gulp.task('image-min', ['jimp-resize'], () =>
    gulp.src('src/img/staging/*')
        .pipe(imagemin([
            imagemin.gifsicle(),
            imageminMozjpeg({
                quality: 90
            }),
            imagemin.optipng(),
            imagemin.svgo()
        ]))
        .pipe(gulp.dest('dist/img'))
);

gulp.task('images', ['jimp-resize', 'image-min']);*/

/*gulp.task('imageresize', function () {
    gulp.src('src/img/*')
        .pipe(imageResize({
        width : 100,
        height : 100,
        crop : true,
        upscale : false
    }))
        .pipe(gulp.dest('dist'));
});*/

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function() {
    //gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
    //    .pipe(gulp.dest('dist/vendor/bootstrap'))

    //gulp.src(['node_modules/bootstrap/less/**/*'])
    //    .pipe(gulp.dest('src/bootstrap/less'))
    gulp.src(['src/*.*'])
        .pipe(gulp.dest('dist'))

    gulp.src(['src/img/*.svg'])
        .pipe(gulp.dest('dist/img'))

    gulp.src(['node_modules/bootstrap/dist/js/*.min.js'])
        .pipe(gulp.dest('dist/bootstrap/js'))

    gulp.src(['node_modules/bootstrap/dist/fonts/*'])
        .pipe(gulp.dest('dist/bootstrap/fonts'))

    gulp.src(['node_modules/owl.carousel/dist/*.min.js'])
        .pipe(gulp.dest('dist/vendor/owl.carousel'))

    gulp.src(['node_modules/owl.carousel/dist/assets/*.min.css'])
        .pipe(gulp.dest('dist/vendor/owl.carousel/assets'))

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('dist/vendor/jquery'))

    gulp.src(['node_modules/simple-line-icons/*/*'])
        .pipe(gulp.dest('dist/vendor/simple-line-icons'))

    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest('dist/vendor/font-awesome'))
})

// Run everything
gulp.task('default', [ 'nunjucks', 'less', 'copy', 'minify', 'minify-css', 'minify-js' , 'images']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
    })
})

// Dev task with browserSync
gulp.task('dev', [ 'nunjucks', 'less', 'copy', 'minify', 'minify-css', 'minify-js', 'browserSync'], function() {
    // gulp.watch('src/*.html', ['minify']);
    gulp.watch('src/less/**/*.less', ['less']);
    //gulp.watch('dist/css/*.css', ['minify-css']);
    gulp.watch('src/js/*.js', ['minify-js']);
    gulp.watch("src/nunjucks/**/*.html", ['nunjucks']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('dist/*.html', browserSync.reload);
    gulp.watch('dist/js/*.js', browserSync.reload);
});
