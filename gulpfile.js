var gulp = require('gulp');
var gtx = require('./');
var concat = require('gulp-concat');
var path = require('path');

var buffer = require('gulp-buffer');


gulp.task('files', function () {

    var destDir = path.join("test", "finished");

    return gulp.src("test/fixtures/**/*.css")
        .pipe(gtx({
            basefolder:26869,
            nodeId:84,
            templateId:3987,
            host:"https://ecms.swarovski.com"
        }))
        .pipe(gulp.dest(destDir));
});


gulp.task('stream', function () {

    var destDir = path.join("test", "finished");

    return gulp.src("test/fixtures/**/*.css")
        .pipe(concat('final.css'))
        .pipe(buffer())
        .pipe(gtx({
            basefolder:26869,
            nodeId:84,
            templateId:3987,
            host:"https://ecms.swarovski.com"
        }))
        .pipe(gulp.dest(destDir));
});