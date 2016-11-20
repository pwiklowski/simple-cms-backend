var http = require('http');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var dispatch = require('dispatch');

const PORT=12001; 

var config = {
  "resources": [
    { name: "cat", isMultiple: true, isWritable: true },
    { name: "dog", isMultiple: true, isWritable: true },
    { name: "shoe", isMultiple: true, isWritable: true },
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
var initHandlers = () => {
  config.resources.forEach((resource) =>{
    var r = {};
    var collection = db.collection(resource.name);
    if (resource.isMultiple !== undefined && resource.isMultiple === true){
      r.GET = (req, res, id) => {
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
          collection.deleteOne({_id:ObjectId(id)}).then((item) => {
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end();
          });
        }
        r.PUT = (req, res, id) => {
          var jsonString = "";
          req.on('data', data => jsonString += data);
          req.on('end', () => {
            var obj = JSON.parse(jsonString);
            collection.updateOne({_id:ObjectId(id)}, obj, (err, item) => {
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(JSON.stringify(obj));
            });
          });
        }
      }
      routing["/"+resource.name+"/:id"] = r;

      var all = {};
      all.GET = (req, res, id) => {
        collection.find({}).toArray((err, items) => {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify(items));
        });
      }
      if (resource.isWritable !== undefined && resource.isWritable === true)
      {
        all.PUT = (req, res, id) => {
          var jsonString = "";
          req.on('data', data => jsonString += data);
          req.on('end', () => {
            var obj = JSON.parse(jsonString);
            collection.insertOne(obj, (err, result)=>{
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(JSON.stringify(result.ops[0]));
            });
          });
        }
      }
      routing["/"+resource.name] = all;
    }else{
      r.GET = (req, res, next) => { //TODO
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(resource.name);
      }
      if (resource.isWritable !== undefined && resource.isWritable === true){
        r.POST = (req, res, next) => { //TODO
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(resource.name);
        }
      }
      routing["/"+resource.name] = r;
    }
  });
};
console.log(config);

var url = "mongodb://127.0.0.1:27017/cms";
MongoClient.connect(url, function(err, database) {
  console.log("Connected correctly to server");
  db = database;
  initHandlers();
  var server = http.createServer(dispatch(routing));
  server.listen(PORT, function(){
      console.log("Server started");
  });
});
