var util = require('util');

var Store = require('../lib/store');

var sqlite = new Store({
  type: 'sqlite3',
  file: 'test.sqlite',
  global: true
});


sqlite.Model('User', require('./models/user'));
//sqlite.Model('Post', require('./models/post'));


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
});