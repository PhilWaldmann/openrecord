var should = require('should');

var Store = require('../../lib/store');

describe('Context', function(){
  var store = new Store();

  var my_context = {foo: 'bar'};

  store.Model('User', function(){
    this.attribute('login', String);
    
    this.beforeValidation(function(){
      //In the record scope (this == record)
      this.context.should.be.eql(my_context);
      this.validate.should.be.a.Function;
    });
  });
  var User = store.Model('User');

  describe('setContext()', function(){
  
    it('has method', function(){
      User.setContext.should.be.a.Function;
    });

    it('returns a chained Model', function(){
      var ChainedModel = User.setContext();
      ChainedModel.should.not.be.eql(User);
      ChainedModel.should.be.an.instanceof(Array);
    });
    
    it('has the right context on record scope', function(next){
      var phil = User.setContext(my_context).new({login: 'phil'});
      phil.isValid(function(){
        next();
      });
    });

    it('has the right context on model scope', function(){
      User.setContext(my_context).context.should.be.equal(my_context);
    });

  });

});

