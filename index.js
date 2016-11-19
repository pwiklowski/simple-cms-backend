var http = require('http');
var HttpDispatcher = require('httpdispatcher');
var MongoClient = require('mongodb').MongoClient

var dispatcher     = new HttpDispatcher();

const PORT=8080; 

var config = {
  "resources": [
    { url: "/test1", res: "test1", isWritable: true },
    { url: "/test2", res: "test2" },
    { url: "/test3", res: "test3" },
    { url: "/test4", res: "test4" }
  ]
};

config.resources.forEach((resource) =>{
  dispatcher.onGet(resource.url, function(req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(resource.res);
  });    

  if (resource.isWritable !== undefined && resource.isWritable === true){
    dispatcher.onPost(resource.url, function(req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(resource.res);
    });
  }
});

console.log(config);

function handleRequest(request, response){
    try {
        console.log(request.url);
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}
var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log("Server started");
});