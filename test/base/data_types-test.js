var should = require('should');

var Store = require('../../lib/store');

describe('Data Types', function(){
  var store = new Store();
    
  describe('getType()', function(){
    it('exists', function(){
      should.exist(store.getType);
      store.getType.should.be.a.Function;
    });
    
    var type = store.getType(String);

    it('returns the correct type', function(){      
      type.should.have.property('cast');
    });
    
    it('casts an integer to a string', function(){
      type.cast(1234).should.be.equal('1234');
    });
  });
  
  
  
  describe('addType()', function(){
    it('exists', function(){
      should.exist(store.addType);
      store.addType.should.be.a.Function;
    });
    
    var type = store.addType({
      name: RegExp,
      cast: function(value){
        return new RegExp(value);
      }
    });

    var type = store.getType(RegExp);

    it('returns the correct type', function(){      
      type.should.have.property('cast');
    });
    
    it('casts an string to an regexp', function(){
      type.cast('(.*)').should.be.an.instanceOf(RegExp);
    });
    
    
    var type = store.addType({
      name: [RegExp, 'regexp'],
      cast: function(value){
        return new RegExp(value);
      },
      custom_value: 'test'
    });

    var type = store.getType('regexp');

    it('returns the correct type (multiple names)', function(){      
      type.should.have.property('cast');
    });
    
    it('casts an string to an regexp (multiple names)', function(){
      type.cast('(.*)').should.be.an.instanceOf(RegExp);
    });
    
    it('allowes custom values', function(){      
      type.should.have.property('custom_value');
    });
  });
  
  
});