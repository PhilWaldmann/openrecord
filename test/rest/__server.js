var restify = require('restify');

var users = require('../fixtures/json/users');
var posts = require('../fixtures/json/posts');

before(function(ready){
  
  var server = restify.createServer({
    name: 'openrecord',
    version: '1.0.0'
  });
  
  
  function filterRecords(records, params){
    var tmp = [];
    for(var i = 0; i < records.length; i++){
      var record = records[i];
      
      for(var name in params){
        if(params[name] instanceof Array){
          if(params[name].indexOf(record[name].toString()) !== -1){
            tmp.push(record);
          }
        }else{
          if(record[name] == params[name]){
            tmp.push(record);
          }
        }          
      }
    }
    return tmp;
  }
  
  
  
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  
  // USERS
  server.get('/users', function (req, res, next) {
    var params = req.params;
    
    if(Object.keys(params).length > 0){
      res.send({data: filterRecords(users.data, params)});
    }else{
      res.send(users);
    }
    
    return next();
  });
  
  
  server.get('/users/:id', function (req, res, next) {
    var id = parseInt(req.params.id, 10);
    res.send({
      data:users.data[id - 1],
      success: true
    });
    return next();
  });
  
  
  server.put('/users/:id', function (req, res, next) {
    var params = req.params;
    var data = users.data[params.id];

    data.login = params.login;

    res.send({
      data: data,
      success: true
    });
    return next();
  });
  
  
  server.post('/users', function (req, res, next) {
    var data = req.params;
    data.id = users.data.length;

    res.send({
      data: data,
      success: true
    });
    return next();
  });
  
  
  server.del('/users/:id', function (req, res, next) {
    var params = req.params;
    var data = users.data[params.id];
    //DELETE...
    res.send({
      success: true
    });
    return next();
  });
  
  
  
  //POSTS
  server.get('/posts', function (req, res, next) {
    var params = req.params;
    
    if(Object.keys(params).length > 0){
      res.send({data: filterRecords(posts.data, params)});
    }else{
      res.send(posts);
    }
    
    return next();
  });
  
  server.get('/posts/:id', function (req, res, next) {
    var id = parseInt(req.params.id, 10);
    res.send({
      data:posts.data[id - 1],
      success: true
    });
    return next();
  });





  server.listen(8889, ready);
});