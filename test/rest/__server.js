var restify = require('restify');
var Store = require('../../lib/store');


var store;
var database = __dirname + '/rest_server.sqlite3';


before(function(next){
  beforeSQLite(database, [
    'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
    'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
    'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
    'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@rest.com", "2014-01-05"), ("michl", "michl@rest.com", "2014-01-10"), ("admin", "admin@rest.com", "2014-01-01")',
    'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
    'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")'
  ], next);
});


before(function(ready){
  store = new Store({
    type: 'sqlite3',
    file: database
  });
  store.setMaxListeners(0);

  store.Model('User', function(){
    this.hasMany('posts');
    this.hasMany('threads');
  });
  store.Model('Post', function(){
    this.belongsTo('user');
    this.belongsTo('thread');
  });
  store.Model('Thread', function(){
    this.belongsTo('user');
    this.hasMany('posts');
  });

  store.ready(ready);
});


after(function(){
  afterSQLite(database);
});



before(function(ready){

  var server = restify.createServer({
    name: 'openrecord',
    version: '1.0.0'
  });

  var User = store.Model('User');
  var Post = store.Model('Post');



  server.use(restify.plugins.acceptParser(server.acceptable));
  server.use(restify.plugins.queryParser());
  server.use(restify.plugins.bodyParser());


  // USERS
  server.get('/users', function (req, res, next) {
    User.where(req.query).exec(function(users){
      res.send({
        data: users.toJson()
      });
      next();
    });
  });


  server.get('/users/:id', function (req, res, next) {
    User.find(req.params.id).exec(function(user){
      res.send({
        data: user.toJson()
      });
      next();
    });
  });


  server.put('/users/:id', function (req, res, next) {
    User.find(req.params.id).exec(function(user){
      if(user){
        user.set(req.body.data);
        user.save(function(success){
          res.send({
            data: user.toJson(),
            success: success
          });
          next();
        });
      }else{
        res.send({
          success: false
        });
        next();
      }
    });
  });


  server.post('/users', function (req, res, next) {
    User.create(req.body.data, function(success){
      res.send({
        data: this.toJson(),
        success: success
      });
      next();
    });
  });


  server.del('/users/:id', function (req, res, next) {
    User.find(req.params.id).exec(function(user){
      if(user){
        user.set(req.params);
        user.delete(function(success){
          res.send({
            success: success
          });
          next();
        });
      }else{
        res.send({
          success: false
        });
        next();
      }
    });
  });



  // POSTS
  server.get('/posts', function (req, res, next) {
    Post.where(req.query).exec(function(posts){
      res.send({
        data: posts.toJson()
      });
      next();
    });
  });


  server.get('/posts/:id', function (req, res, next) {
    Post.find(req.params.id).exec(function(post){
      res.send({
        data: post.toJson()
      });
      next();
    });
  });


  server.put('/posts/:id', function (req, res, next) {
    Post.find(req.params.id).exec(function(post){
      if(post){
        post.set(req.body.data);
        post.save(function(success){
          res.send({
            data: post.toJson(),
            success: success
          });
          next();
        });
      }else{
        res.send({
          success: false
        });
        next();
      }
    });
  });


  server.post('/posts', function (req, res, next) {
    Post.create(req.body.data, function(success){
      res.send({
        data: this.toJson(),
        success: success
      });
      next();
    });
  });


  server.del('/posts/:id', function (req, res, next) {
    Post.find(req.params.id).exec(function(post){
      if(post){
        post.set(req.params);
        post.delete(function(success){
          res.send({
            success: success
          });
          next();
        });
      }else{
        res.send({
          success: false
        });
        next();
      }
    });
  });


  server.listen(8889, ready);
});
