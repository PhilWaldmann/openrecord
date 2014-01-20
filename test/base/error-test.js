var should = require('should');

var Store = require('../../lib/store');

describe('Error', function(){
  var store = new Store();

  store.Model('User', function(){
        
  });
  
  var User = store.Model('User');
  var phil = new User();
  
  
  describe('errors.add()', function(){
    it('add attribute error', function(){
      phil.errors.add('attribute_name', 'not valid');
    });
    
    it('add base error', function(){
      phil.errors.add('can not be deleted');
    });
    
    
    it('is an array of errors', function(){
      phil.errors['attribute_name'].should.be.an.instanceOf(Array);
      phil.errors['attribute_name'][0].should.be.equal('not valid');
    });
    
    it('has base errors', function(){
      phil.errors['base'].should.be.an.instanceOf(Array);
      phil.errors['base'][0].should.be.equal('can not be deleted');
    })
  });
  
});