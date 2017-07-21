/*==================================================
=            npm install gulp --sav-dev            =
==================================================*/
// to disable>dest path replace fs
/*----------  dependance  > package.json > node_modules  ----------*/
var gulp           = require('gulp'),
    bs             = require('browser-sync'),
    slim           = require("gulp-slim"),
    sass           = require('gulp-sass'),
    plumber        = require('gulp-plumber'),
    premailer      = require('gulp-premailer'),
    autoprefixer   = require('gulp-autoprefixer'),
    rename         = require('gulp-rename'),
    using          = require('gulp-using'),
    rm             = require('gulp-rimraf'),
    rimraf         = require('rimraf'),
    prettify       = require('gulp-html-prettify'),
    changed        = require('gulp-changed');
    const notifier = require('node-notifier');
// src & output
var  src = 'src/';

// browser-sync task !attention il faut un index.html obligatoire
gulp.task('bs',['slim','sass','premailer'], function () {
  bs({
    // browser: 'chrome',
    server: {
      baseDir: 'render/FR'
    }
  })
})

// cp img folder
gulp.task('img', function() {
  return gulp.src([src+'**/images/*.{png,jpg,gif}'])
  // .pipe(npm()) // img optimize
  // .pipe(changed('src#<{(||)}>#images/'))
  .pipe(gulp.dest('render'))
  .on('end',function () {
    // start slim to render
    gulp.start('slim');
  })
})

// sass task
gulp.task('sass',['slim'], function() {
  return gulp.src(src+'**/scss/*.scss')
  .pipe(plumber())
  // .pipe(sass())
  .pipe(sass({errLogToConsole: true}))
  .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
  .pipe(rename(function(path) {
    path.dirname += "/../css";
  }))
  .pipe(gulp.dest('render'))
  .pipe(using())
  // .pipe(bs.reload({stream: true }));
})

// slim task
gulp.task('slim', function () {
  var slimEnd = false;
  return gulp.src([src+'**/slim/*.slim'])
  .pipe(plumber({
    errorHandler: function (err) {
      notifier.notify({
        'title': 'Oups, erreur Gulp',
        'message': 'message de l\'erreur'
      });
    }
  }))
  .pipe(slim( {pretty: true, indent: 2 })) // cb // {read:false},
  // .pipe(using())
  // .pipe(gulp.dest('render')) // slim folder
  .pipe(rename(function(path) {
    path.dirname += "/../";
  }))
  .pipe(gulp.dest('render')) // html folder
  .pipe(using())
  .on('end',function () {
    slimEnd = true;
    premailergo(slimEnd);
  })
});
//
// premailer task // si erreur sass > rendu incomplet à gérer
gulp.task('premailer', function (cb) {
  var premailEnd = false;
  gulp.src('render/**/*.html')
  .pipe(plumber())
  .pipe(premailer()) //,{read:false}
  .pipe(prettify({indent_car:'', indent_size: 2}))
  .pipe(gulp.dest('render'))
  .on('end',function () {
    premailEnd = true;
    if(cb){
      console.log('premailerOK: '+premailEnd+' rm render/slim folder ');
      gulp.start('rmRenderSlimFolder');
      gulp.start('rmRenderCssFolder');
      // run cp fct to continue stream
      cb()
    }
  })
  .pipe(bs.reload({
    stream: true
  }))
});

gulp.task('rmRenderSlimFolder', function (cb) {
  rimraf('./render/**/slim',function (err) {
    console.log("all done del slim");
    return cb(null);
  });
});
gulp.task('rmRenderCssFolder', function (cb) {
  rimraf('./render/**/css',function (err) {
    console.log("all done del css");
    return cb(null);
  });
});
//
function premailergo (slimEnd) {
  if(slimEnd=true){
    console.log('slim complete: '+slimEnd);
    gulp.start(['premailer']);
  }else{
    console.log('slim pas prêt.......')
  }
};

// lancement > fonction watch
gulp.task('dev',['bs','img','slim','sass'], function() {
  gulp.watch([src+'**/images/*.{png,jpg,gif}'],['img'])
  gulp.watch([src+'**/**/*.slim'],['sass','slim','img']);
  gulp.watch(src+'**/scss/*.scss',['sass','slim']);
});
