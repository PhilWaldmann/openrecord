var should = require('should');
var Store = require('../../../lib/store');

describe('REST Client: Exec', function(){
  var store = new Store({
    type: 'rest',
    url: 'http://localhost:8889',
    version: '~1.0'  
  });
  
  store.Model('User', function(){
    this.attribute('id', Number, {primary: true});
    this.attribute('login', String);
    this.attribute('email', String);
  });
  
  it('loads records from the rest server', function(next){
    store.ready(function(){
      var User = store.Model('User');
      
      User.exec(function(results){
        results.length.should.be.equal(2);
        next();
      });
    });      
  });
  
  
});