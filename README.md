# gulp-gentics-asset
> A gentics asset uploader plugin for gulp 3

## Usage

First, install `gulp-gentics-asset` as a development dependency:

```shell
npm install --save-dev gulp-gentics-asset
```

Then, add it to your `gulpfile.js`:

### Regex Replace
```javascript
var gtx = require('gulp-gentics-asset');

gulp.task('stream', function () {

	var destDir = path.join("test", "finished");

	return gulp.src("test/fixtures/**/*.css")
		.pipe(concat('final.css'))
		.pipe(buffer())
		.pipe(gtx({
			basefolder:26869,
			nodeId:84,
			templateId:3987,
			host:"https://gentics.cms.host.com"
		}))
		.pipe(gulp.dest(destDir));
});
```

## API

gulp-gentics-asset can be called with options.

### gulp-gentics-asset options

An argument, `options`, should be passed.

#### options
Type: `Object`

##### options.basefolder
Type: `number`
Default: `0`

A folder id in the CMS where the files should be uploaded.

##### options.nodeId
Type: `number`
Default: `0`

A node id in the CMS where the files should be uploaded.

##### options.templateId
Type: `number`
Default: `0`

Id of the template that should be used for the CSS pages.

##### options.host
Type: `number`
Default: `0`

URL to the CMS system.

