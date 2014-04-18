var restify = require('restify');

var index_users = require('../fixtures/json/index_users');

before(function(ready){
  
  var server = restify.createServer({
    name: 'openrecord',
    version: '1.0.0'
  });
  
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  server.get('/users', function (req, res, next) {
    res.send(index_users);
    return next();
  });
  
  server.get('/users/1', function (req, res, next) {
    res.send(index_users[0]);
    return next();
  });

  server.listen(8889, ready);
});