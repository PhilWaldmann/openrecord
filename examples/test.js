var util = require('util');

var Store = require('../lib/store');

var sqlite = new Store({
  type: 'sqlite3',
  file: './examples/test.sqlite',
  global: true
});


sqlite.Model('User', require('./models/user'));
//sqlite.Model('Post', require('./models/post'));

/*
CREATE TABLE users(
  id  INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT NOT NULL,
  email TEXT
);
*/

sqlite.ready(function(){
  
  
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
  
  
  User.find(12) //id=12
  User.find(12, 3) //id IN (12, 3)
  User.find([12, 3]) //id IN (12, 3)
  
  User.where({login:null}).exec(console.log); //login is null
  User.where({login:'phil'}).exec(console.log); //login = 'phil'
  User.where({login_like:'phil%'}).exec(console.log); //login LIKE 'phil%
  User.where({login_ilike:'/phil.+/'}).exec(console.log); //login SIMILAR TO '/phil.+/'
  User.where({login:['phil', 'michl']}).exec(console.log); //login IN ('phil', 'michl')
  User.where('login = ?', 'phil').exec(console.log); //login = 'phil'
  User.where(['login = ?', 'phil']).exec(console.log); //login = 'phil'
  User.where('login IN (?)', ['phil', 'michl']).exec(console.log); //login IN('phil', 'michl')
  User.where('login = :login', {login:'phil'}).exec(console.log); //login = 'phil'
  User.where({posts:{name:'First Post'}}).exec(console.log); //posts.name='First Post'
 
 
  
  
  
  
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