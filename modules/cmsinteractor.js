var restly = require("./restly"),
    Q = require("q"),
    inquirer = require("inquirer");


var CMSInteractor = function(options){
    this.basefolderID = 0;
    if (typeof options.basefolder !== "undefined") {
        this.basefolderID = options.basefolder;
    }
    this.nodeId = 0;
    if (typeof options.nodeId !== "undefined") {
        this.nodeId = options.nodeId;
    }
    this.templateId = 0;
    if (typeof options.templateId !== "undefined") {
        this.templateId = options.templateId;
    }
    this.host = "";
    if (typeof options.host !== "undefined") {
        this.host = options.host;
    }
    this.restly = new restly({host:this.host});
    this.loggedin = false;
};

CMSInteractor.prototype.ensurelogin = function() {
    var deferred = Q.defer(),
        interactor = this;
    if (this.loggedin) {
        deferred.resolve(true);
    } else {
        inquirer.prompt([{
            type:"input",
            name:"username",
            message:"Please tell us your CMS username:"
        },{
            type:"password",
            name:"password",
            message:"Please tell us your CMS password:"
        }], function( answers ) {
            interactor.login(answers.username, answers.password).then(function(){
                console.log("Successfully logged in!");
                deferred.resolve(true);
            }).catch(function(err){
                deferred.reject(err);
            });
        });
    }
    return deferred.promise;
};

CMSInteractor.prototype.login = function(username, password) {
    return this.restly.doPOSTJson("/CNPortletapp/rest/auth/login", {
        login: username,
        password: password
    });
}

CMSInteractor.prototype.logout = function() {
    return this.restly.doPOST("/CNPortletapp/rest/auth/logout/" + this.restly.getSID(),{});
};

CMSInteractor.prototype.publishPage = function(pageid) {
    return this.restly.doPOST("/CNPortletapp/rest/page/publish/" + pageid,{});
};

CMSInteractor.prototype.getOrCreateFile = function(filename) {

};

CMSInteractor.prototype.getOrCreateFolder = function(pubdir) {

};

CMSInteractor.prototype.getOrCreatePage = function(filename) {
    var instance = this,
        deferred = Q.defer();
    //first we have to check if the page exists already
    instance.restly.doGET("/CNPortletapp/rest/folder/findPages", {folderId:instance.basefolderID, query:filename})
        .then(function(data){
            if (data.pages && data.pages.length > 0) {
                //Page exists
                deferred.resolve(data.pages[0].id);
            } else {
                //Page needs to be created
                instance.restly.doPOSTJson("/CNPortletapp/rest/page/create",{
                    folderId: instance.basefolderID,
                    templateId: instance.templateId,
                    nodeId: instance.nodeId,
                    language: "en",
                    pageName:filename,
                    fileName:filename
                }).then(function(data){
                    deferred.resolve(data.page.id);
                }).catch(function(error){
                    deferred.reject(error);
                });
            }
        }).catch(function(error){
            deferred.reject(error);
        });
    return deferred.promise;
};

module.exports = CMSInteractor;