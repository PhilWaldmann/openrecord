var should = require('should');

var Store = require('../../lib/store');

describe('Context', function(){
  var store = new Store();

  var my_context = {foo: 'bar'};

  store.Model('User', function(){
    this.attribute('login', String);
    
    this.hasMany('posts');
    
    this.beforeValidation(function(){
      //In the record scope (this == record)
      this.context.should.be.eql(my_context);
      this.validate.should.be.a.Function;
    });
  });
  
  store.Model('Post', function(){
    this.attribute('message', String);
    
    this.beforeValidation(function(){
      //In the record scope (this == record)
      this.context.should.be.eql(my_context);
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
    
    
    it('does not change the context', function(){
      User.setContext(my_context).new({login: 'phil'});
      my_context.should.be.eql({foo:'bar'});
    });
    
    it('passes the context to relational objects', function(){
      var user = User.setContext(my_context).new({login: 'phil', posts:[{message:'test'}]});
      my_context.should.be.eql({foo:'bar'});

      user.context.should.be.eql(my_context);
      user.posts[0].context.should.be.eql(my_context);
    });

  });

});

