var eventStream = require('event-stream'),
    gutil = require('gulp-util');

module.exports = fileWorker;

function fileWorker(run)  {
    return eventStream.map(function(file, done) {
        if (file.isNull()) {
            return done(null, file);
        }
        if (file.isStream()) {
            return done(new gutil.PluginError('gulp-gentics-asset', 'Streaming not supported.'));
        }
        var content = file.contents.toString();
        var ctx = {
            file: file,
            filename: file.path.substr(file.base.length),
            path: file.path,
            originalContent: content
        };

        function next(err, content) {
            if (err) {
                return done(err);
            }
            if (content) {
                file.contents = new Buffer(content);
            }
            done(null, file);
        }

        if (run.length > 1) {
            run.call(ctx, content, next);
        } else {
            next(null, run.call(ctx, content))
        }
    });
}