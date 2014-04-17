var restify = require('restify');

before(function(ready){
  
  var server = restify.createServer({
    name: 'openrecord',
    version: '1.0.0'
  });
  
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  server.get('/users', function (req, res, next) {
    res.send(require('../fixtures/json/index_users'));
    return next();
  });

  server.listen(8889, ready);
});