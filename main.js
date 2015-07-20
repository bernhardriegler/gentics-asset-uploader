var CMSInteractor = require("./modules/cmsinteractor");

var interactor = new CMSInteractor({
    basefolder:26869,
    nodeId:84,
    templateId:3987,
    host:"https://ecms.swarovski.com"
});

interactor.login("testsep","sepchinese2014").then(function(){
   return interactor.getOrCreatePage("styles.css");
}).then(function(id){
    console.log("pageid", id);
    return id;
})/*.then(function(id){
    return interactor.publishPage(id)
})*/.then(function(){
    return interactor.logout();
}).catch(function(error){
    console.error(error);
});
