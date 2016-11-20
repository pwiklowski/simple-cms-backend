var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var dispatch = require('dispatch');

const PORT=8080; 

var config = {
  "resources": [
    { url: "/test1", res: "test1", isWritable: true },
    { url: "/test2", res: "test2" },
    { url: "/test3", res: "test3", isMultiple: true, isWritable: true },
    { url: "/test4", res: "test4" }
  ]
};

var routing = {
    '/config': {
        GET: function (req, res, next) {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(config));
        }
    }
};

var db;

config.resources.forEach((resource) =>{
  var r = {};
  if (resource.isMultiple !== undefined && resource.isMultiple === true){
    r.GET = (req, res, id) => {
        var collection = db.collection(resource.res);
        collection.findOne({_id:ObjectId(id)}).then((item) => {
          if (item !== null){
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(item));
          }else{
            res.writeHead(404, {'Content-Type':'application/json'});
            res.end();
          }
        });
    }
    if (resource.isWritable !== undefined && resource.isWritable === true)
    {
      r.DELETE = (req, res, id) => {
        var collection = db.collection(resource.res);
        collection.deleteOne({_id:ObjectId(id)}).then((item) => {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end();
        });
      }
      r.PUT = (req, res, id) => {
        var collection = db.collection(resource.res);
        var jsonString = "";

        req.on('data', data => jsonString += data);
        req.on('end', () => {
          var obj = JSON.parse(jsonString);
          console.log("POST");
          collection.updateOne({_id:ObjectId(id)}, obj, (err, item) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(obj));
          });
        });
      }
    }
    routing[resource.url+"/:id"] = r;

    var all = {};
    all.GET = (req, res, id) => {
        var collection = db.collection(resource.res);
        collection.find({}).toArray((err, items) => {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(items));
        });
    }
    if (resource.isWritable !== undefined && resource.isWritable === true)
    {
      all.PUT = (req, res, id) => {
        var collection = db.collection(resource.res);
        var jsonString = "";

        req.on('data', data => jsonString += data);
        req.on('end', () => {
          var a = JSON.parse(jsonString);
          collection.insertOne(a, (err, result)=>{
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(result.ops[0]));
          });
        });
      }
    }
    routing[resource.url] = all;
  }else{
    r.GET = (req, res, next) => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(resource.res);
    }
    if (resource.isWritable !== undefined && resource.isWritable === true){
      r.POST = (req, res, next) => {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(resource.res);
      }
    }
    routing[resource.url] = r;
  }
});

console.log(config);

var url = "mongodb://127.0.0.1:27017/cms";
MongoClient.connect(url, function(err, database) {
  console.log("Connected correctly to server");
  db = database;
});

var server = http.createServer(dispatch(routing));
server.listen(PORT, function(){
    console.log("Server started");
});