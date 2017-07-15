var should = require('should');
var Store = require('../../../lib/store');


describe('Postgres: Raw Query', function(){
  var store;
  var database = 'raw_test';



  before(function(next){
    this.timeout(5000);
    beforePG(database, [
      'CREATE TABLE users(id serial primary key, login TEXT NOT NULL, email TEXT)',
      "INSERT INTO users(login, email) VALUES('phil', 'phil@mail.com')"
    ], next);
  });

  before(function(){
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: ''
    });

    store.Model('user', function(){});

    store.setMaxListeners(0);
    store.on('exception', function(){});
  });

  after(function(next){
    afterPG(database, next);
  });


  it('raw() runs the raw sql query', function(next){
    store.ready(function(){
      var User = store.Model('User');

      User.raw('SELECT COUNT(*) FROM users')
      .then(function (result) {
        result.rows.should.be.eql([{count: 1}])
        next();
      })
    });
  });

});
