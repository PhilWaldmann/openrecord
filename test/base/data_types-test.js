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
      type.cast.should.have.property('input');
      type.cast.should.have.property('output');
    });

    it('casts an integer to a string', function(){
      type.cast.input(1234).should.be.equal('1234');
    });
  });



  describe('addType()', function(){
    it('exists', function(){
      should.exist(store.addType);
      store.addType.should.be.a.Function;
    });

    var type = store.addType(RegExp, function(value){
      return new RegExp(value);
    });

    var type = store.getType(RegExp);

    it('returns the correct type', function(){
      type.should.have.property('cast');
      type.cast.should.have.property('input');
      type.cast.should.have.property('output');
    });

    it('casts an string to an regexp', function(){
      type.cast.input('(.*)').should.be.an.instanceOf(RegExp);
    });

  });


});
