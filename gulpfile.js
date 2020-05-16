const { src, dest, task, series, watch, parallel } = require('gulp');
const sass = require('gulp-sass');
const rm = require( 'gulp-rm' );
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const sassGlob = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const px2rem = require('gulp-smile-px2rem');
const gcmq = require('gulp-group-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const svgo = require('gulp-svgo');
const svgSprite = require('gulp-svg-sprite');
const gulpif = require('gulp-if'); 

const env = process.env.NODE_ENV;


// config ES6 is .. SRC_PATH, DIST_PATH, STYLES_LIBS, JS_LIBS
const { SRC_PATH, DIST_PATH, STYLES_LIBS, JS_LIBS } = require('./gulp.config')

sass.compiler = require('node-sass');


task( 'clean', () => {
  console.log(env);
  return src( `${DIST_PATH}/**/*`, { read: false })
    .pipe( rm() )
})

task( 'copy:html', () => {
    return src(`${SRC_PATH}/*.html`)
    .pipe(dest(DIST_PATH))
    .pipe(reload({stream: true}));
})

const pics = [
  `src/pictures/*.jpg`,
  `src/pictures/*.png`
]

task('copyPicture', () => {
  return src(pics)
  .pipe(dest(`${DIST_PATH}/pictures`))
  .pipe(reload({stream: true}));
})

/*
const styles = [
  'node_modules/normalize.css/normalize.css',
  'scss/main.scss'
]
*/

const st = [
  'src/styles/**/*.scss'
]

task( 'styles', () => {
    return src([...STYLES_LIBS, 'src/styles/main.scss'])
    .pipe(gulpif(env==="dev", sourcemaps.init()))
    .pipe(concat('main.min.scss'))
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(px2rem({dpr : 1}))
    .pipe(gulpif(env==="dev", 
      autoprefixer({
        cascade: false 
      })))
    .pipe(gulpif(env==="prod", gcmq()))
    .pipe(gulpif(env==="prod", cleanCSS()))
    .pipe(gulpif(env==="dev", sourcemaps.write()))
    .pipe(dest(DIST_PATH))
    .pipe(reload({stream: true}));
})

task('server', () => {
  browserSync.init({
      server: {
          baseDir: "./dist"
      },
      open: false
  });
});

/*
const libs = [
  'node_modules/jquery/dist/jquery.js',
  'src/scripts/*.js'
]
*/

task('scripts', () => {
  return src([...JS_LIBS, 'src/scripts/*.js'])
  .pipe(gulpif(env==="dev", sourcemaps.init()))
  .pipe(concat('main.min.js', {newLine: ";"}))
  .pipe(gulpif(env==="prod", babel({
    presets: ['@babel/env']
  })))
  .pipe(gulpif(env==="prod", uglify()))
  .pipe(gulpif(env==="dev", sourcemaps.write()))
  .pipe(dest(DIST_PATH))
  .pipe(reload({stream: true}));
})

task('icons', () => {
  return src(`${SRC_PATH}/svg/*.svg`)
  .pipe(svgo({
    plugins: [
      {
        removeAttrs: {
          attrs: "(fill|style|width|height|opacity|data.*)"
        }
      }
    ]
  }))
  .pipe(svgSprite({
    mode: {
      symbol: {
        sprite: "../sprite.svg"
      }
    }
  }))
  .pipe(dest(`${DIST_PATH}/images/icons`))
})

task('watch', () => {
  watch('./src/styles/**/*.scss', series('styles'));
  watch('./src/*.html', series("copy:html"));
  watch('./src/**/*.png', series("copyPicture"));
  watch('./src/**/*.png', series("copyPicture"));
  watch('./src/scripts/*.js', series("scripts"));
  watch('./src/svg/*.svg', series("icons"));  
})


task(
  'default', 
  series(
  "clean",  
  parallel("copy:html", 'copyPicture', "styles", "scripts", "icons"), 
  parallel("watch", "server")
  )
)

task(
  'build', 
  series(
  "clean",  
  parallel("copy:html", 'copyPicture', "styles", "scripts", "icons")
  )
)