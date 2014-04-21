var should = require('should');
var Store = require('../../../lib/store');

describe('REST Client: Update', function(){
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
  
  
  it('updates a record (update)', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.find(1).exec(function(record){
        record.id.should.be.equal(1);
        record.login = 'philipp';
        record.save(function(success){
          success.should.be.true;
          next();
        });        
      });
    });      
  });
    
  
});