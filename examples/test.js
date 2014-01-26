var util = require('util');

var Store = require('../lib/store');

var sqlite = new Store({
  type: 'sqlite3',
  file: './examples/test.sqlite',
  global: true
});


sqlite.Model('User', require('./models/user'));
sqlite.Model('Post', require('./models/post'));
sqlite.Model('Thread', require('./models/thread'));
/*
CREATE TABLE users(
  id  INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT NOT NULL,
  email TEXT
);

CREATE TABLE posts(
  id  INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  thread_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  message TEXT
);

CREATE TABLE threads(
  id  INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL
);
*/

sqlite.ready(function(){
  console.log('-- READY --');
  
  var phil = User.new({
    email: 'philipp@email.com',
    login: 'admin',
    first_name: 'Philipp',
    posts:[{
      title:'Frage'
    }, {
      title:'Peter'
    }]
  });
  //return;
    
  User.exec(console.log);

  User.include('posts', 'threads').where({posts:{id:[1, 2, 3]}}).limit(100).exec(function(records){
    console.log('------>', records);
  });
    
  
  /*
  
  <attr_name>_like
  <attr_name>_gt
  <attr_name>_lt
  <attr_name>_gte
  <attr_name>_lte
  <attr_name>_between
  <attr_name>_not
  <attr_name>_not_like
  <attr_name>_not_between 
  */
  

/*  User.find([1, 2], function(result){
    console.log('FIND RESULT', result);
  });
  */
  /*
  phil.save(function(saved){
    console.log('phil saved?', saved, this.errors);
  });
*/
  
  //NICE TO HAVE: console.log(phil.posts.all.email = 'blaa');
  
  
  /* IDEA!
  
Project.findAndCountAll({where: ["title LIKE 'foo%'"], offset: 10, limit: 2}).success(function(result) {
  console.log(result.count);
  console.log(result.rows);
});
  
  */
  
});