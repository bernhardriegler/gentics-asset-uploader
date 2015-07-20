var rest = require('restler'),
    Q = require("q");


var RestlyRequestObject = function(deferred,method,uri,data){
    this.deferred = deferred;
    this.method = method;
    this.uri = uri;
    this.data = data;
};

var restly = function(options){
    this.host = "";
    if (typeof options.host !== "undefined") {
        this.host = options.host;
    }
    this.requestthreshold = 4;
    if (typeof options.threshold !== "undefined") {
        this.requestthreshold = options.threshold;
    }
    this.requestConfig = {
        query: {
            sid: null
        },
        headers: {
            Cookie: null
        }
    };
    this.queue = [];
};

restly.prototype.doGET = function(uri, data) {
    var deferred = Q.defer(),options={query:data},requestObject;
    options.query.sid = this.requestConfig.query.sid;
    options.headers = this.requestConfig.headers;
    requestObject = new RestlyRequestObject(deferred,"get",uri,options);
    this._addToQueue(requestObject);
    this._workQueue();
    return deferred.promise;
};

restly.prototype.doGETJson = function(uri, data) {
    var deferred = Q.defer(),requestObject = new RestlyRequestObject(deferred,"json",uri,data);
    this._addToQueue(requestObject);
    this._workQueue();
    return deferred.promise;
};

restly.prototype.doPOST = function(uri, data) {
    var deferred = Q.defer(),options={data:data,query:{}},requestObject;
    options.query.sid = this.requestConfig.query.sid;
    options.headers = this.requestConfig.headers;
    requestObject = new RestlyRequestObject(deferred,"post",uri,options);
    this._addToQueue(requestObject);
    this._workQueue();
    return deferred.promise;
};

restly.prototype.doPOSTJson = function(uri, data) {
    var deferred = Q.defer(),requestObject = new RestlyRequestObject(deferred,"postJson",uri,data);
    this._addToQueue(requestObject);
    this._workQueue();
    return deferred.promise;
};

restly.prototype.getSID = function() {
  return this.requestConfig.query.sid;
};

restly.prototype._workQueue = function() {
    var instance = this,
        requestObject;
    if (instance.queue.length <= instance.requestthreshold && instance.queue.length > 0) {
        requestObject = instance._getFromQueue();
        if (typeof requestObject !== "undefined") {
            instance._makeRequest(requestObject.method, requestObject.uri, requestObject.data).then(function (response) {
                requestObject.deferred.resolve(response);
                instance._workQueue();
            }).catch(function (error) {
                requestObject.deferred.reject(error);
                instance._workQueue();
            });
        }
    }
};

restly.prototype._addToQueue = function(requestObject) {
  this.queue.unshift(requestObject);
};

restly.prototype._getFromQueue = function() {
    return this.queue.pop();
}

restly.prototype._makeRequest = function(method, uri, data) {
    var deferred = Q.defer(),
        instance = this;

    rest[method](instance.host + uri, data, instance.requestConfig).on("success", function (data, response) {

        if (!instance.requestConfig.query.sid && data.sid) {
            instance.requestConfig.query.sid = data.sid;
        }
        if (!instance.requestConfig.headers.Cookie && response.headers["set-cookie"]) {
            instance.requestConfig.headers.Cookie = response.headers["set-cookie"];
        }

        deferred.resolve(data);
    }).on("fail", function (data, response) {
        deferred.reject({data:data, url:uri, response:response});
    }).on("error", function (data, response) {
        deferred.reject({data:data, url:uri, response:response});
    });

    return deferred.promise;
};


module.exports = restly;
