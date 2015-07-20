"use strict";

var HashMap = require('hashmap'),
    Q = require("q"),
    fileworker = require('./fileworker'),
    gutil = require('gulp-util'),
    CMSInteractor = require("./cmsinteractor");

var Asset = function(filename, path, content, interactor){
    this.files = new HashMap();
    this.content = content;
    this.filename = filename;
    this.path = path;
    this.cms = interactor;
};

Asset.prototype.workFile = function() {
    var deferred = Q.defer(),
        worker = this,
        assets = this.content.match(/url\(([^)]+)\)/g),
        tagnamepromises = [];

    //Find all assets and populate the set of assets
    assets.forEach(function (asset) {
        // Copy asset.
        asset = asset.replace("url(", "").replace(/[\)|"|']/g, "");
        var parts = asset.match(/^(?!http|data).+\.([eot|svg|tiff|woff|htc|ttf|png|jpg|jpeg|gif|bmp]+)/),
            assetPath = parts && parts.length>0 ? parts[0] : undefined;
        if (typeof assetPath !== "undefined") {
            worker.files.set(assetPath, assetPath);
        }
    });

    //We need to get the tagnames for the file, upload the file if it does not exist
    //or update it if it has changed
    worker.files.forEach(function(value, key){
        tagnamepromises.push(worker.getTagName(key));
    });

    Q.all(tagnamepromises).then(function(values){
        //Sort values by their length to prevent files with the same names in different
        //folders to cause problems if the shorter path will be replaced first
        values.sort(function(a, b){
            return (b.filepath.length - a.filepath.length); // DESC -> b - a
        });
        //Do the actual replacing in the content
        values.forEach(function(value){
            worker.content = replaceAll(worker.content,value.filepath, value.replacement);
        });
        deferred.resolve(worker.content);
    }).catch(function(error){
       deferred.reject(error);
    });
    return deferred.promise;
};

Asset.prototype.getTagName = function(filepath) {
    var deferred = Q.defer();

    var nodename = "imgurl";

    console.log("checking", this.path, this.filename, filepath);
    deferred.resolve({filepath:filepath, replacement:"<node "+nodename+">"});

    return deferred.promise;
};


module.exports = function(options){
    var interactor = new CMSInteractor(options);
    return fileworker(function(content, callback){
        var worker = new Asset(this.filename, this.path, content, interactor);
        interactor.ensurelogin().then(function(){
            return worker.workFile();
        }).then(function(newcontent){
            callback(null, newcontent);
        }).catch(function(message){
            if (typeof message === 'undefined') {
                message = "Something bad happened with " + this.filename;
            }
            callback(new gutil.PluginError('gulp-gentics-asset', message), content);
        });
    });
};

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}