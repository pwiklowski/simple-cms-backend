var http = require('http');
var MongoClient = require('mongodb').MongoClient
var dispatch = require('dispatch');

const PORT=8080; 

var config = {
  "resources": [
    { url: "/test1", res: "test1", isWritable: true },
    { url: "/test2", res: "test2" },
    { url: "/test3", res: "test3", isMultiple: true },
    { url: "/test4", res: "test4" }
  ]
};

var routing = {
    '/test': {
        GET: function (req, res, next) {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end(resource.res);
        },
        POST: function (req, res, next) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end(resource.res);
        }
    }
};

config.resources.forEach((resource) =>{
  var r = {};
  if (resource.isMultiple !== undefined && resource.isMultiple === true){
    r.GET = (req, res, id) => {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(resource.res + " " + id);
    }
    if (resource.isWritable !== undefined && resource.isWritable === true){
      r.POST = (req, res, id) => {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end(resource.res + " " + id);
      }
    }
    routing[resource.url+"/:id"] = r;
  }else{
    r.GET = (req, res, next) => {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(resource.res);
    }
    if (resource.isWritable !== undefined && resource.isWritable === true){
      r.POST = (req, res, next) => {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end(resource.res);
      }
    }
    routing[resource.url] = r;
  }
});

console.log(config);

var server = http.createServer(dispatch(routing));
server.listen(PORT, function(){
    console.log("Server started");
});