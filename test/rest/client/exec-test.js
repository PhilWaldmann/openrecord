var should = require('should');
var Store = require('../../../lib/store');

describe('REST Client: Exec', function(){
  var store;
  
  before(function(){
    store = new Store({
      type: 'rest',
      url: 'http://localhost:8889',
      version: '~1.0'  
    });
  
    store.Model('User', function(){
      this.attribute('id', Number, {primary: true});
      this.attribute('login', String);
      this.attribute('email', String);
    });
  });
  
  
  it('loads records from the rest server (index)', function(next){
    store.ready(function(){
      var User = store.Model('User');
      
      User.exec(function(results){
        results.length.should.be.above(2);
        next();
      }, function(err){
        should.not.exist(err);
        next();
      });
    });      
  });
  
  
  it('loads one record from the rest server (show)', function(next){
    store.ready(function(){
      var User = store.Model('User');
      
      User.find(2).exec(function(result){
        result.id.should.be.equal(2);
        result.login.should.be.equal('michl');
        next();
      });
    });      
  });
  
  
  
  it('loads filtered records from the rest server (index)', function(next){
    store.ready(function(){
      var User = store.Model('User');
      
      User.where({login: 'michl'}).exec(function(result){
        result.length.should.be.equal(1);
        result[0].id.should.be.equal(2);
        result[0].login.should.be.equal('michl');
        next();
      });
    });      
  });
  
  
  it('loads filtered records from the rest server via promise (index)', function(next){
    store.ready(function(){
      var User = store.Model('User');
      
      User.where({login: 'michl'}).exec().then(function(result){
        result.length.should.be.equal(1);
        result[0].id.should.be.equal(2);
        result[0].login.should.be.equal('michl');
        next();
      });
    });      
  });
  
  
});