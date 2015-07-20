'use strict';

var assetPlugin = require('../');
var fs = require('fs');
var es = require('event-stream');
var should = require('should');
var File = require('vinyl');
require('mocha');

describe('gulp-gentics-asset', function() {
  describe('css', function() {
      it('should replace string on a buffer', function(done) {
          var file = new File({
              path: 'test/fixtures/test.css',
              cwd: 'test/',
              base: 'test/fixtures',
              contents: fs.readFileSync('test/fixtures/test.css')
          });

          var stream = assetPlugin({});
          stream.on('data', function(newFile) {
              should.exist(newFile);
              should.exist(newFile.contents);
              String(newFile.contents).should.equal(fs.readFileSync('test/expected/test.css', 'utf8'));
              done();
          });

          stream.write(file);
          stream.end();
      });
      it('should not touch external urls', function(done) {
          var file = new File({
              path: 'test/fixtures/test3.css',
              cwd: 'test/',
              base: 'test/fixtures',
              contents: fs.readFileSync('test/fixtures/test3.css')
          });

          var stream = assetPlugin({});
          stream.on('data', function(newFile) {
              should.exist(newFile);
              should.exist(newFile.contents);
              String(newFile.contents).should.equal(fs.readFileSync('test/expected/test3.css', 'utf8'));
              done();
          });

          stream.write(file);
          stream.end();
      });
      it('should be able to handle multiple files', function(done) {
          var file1 = new File({
              path: 'test/fixtures/test.css',
              cwd: 'test/',
              base: 'test/fixtures',
              contents: fs.readFileSync('test/fixtures/test.css')
          });
          var file2 = new File({
              path: 'test/fixtures/test2.css',
              cwd: 'test/',
              base: 'test/fixtures',
              contents: fs.readFileSync('test/fixtures/test2.css')
          });

          var counter = 0;

          var stream = assetPlugin({});

          stream.on('data', function(newFile) {
              should.exist(newFile);
              should.exist(newFile.contents);
              counter++;
              if (counter == 2) {
                  done();
              }
          });

          stream.write(file1);
          stream.write(file2);
          stream.end();
      });

  });
});
