var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Temporary Definition', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    }); 
    
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);

      store.Model('User', function(){
        this.hasMany('posts');
        
        this.scope('tmpValidation', function(){
          this.temporaryDefinition()
          .validatesFormatOf('login', /phil.*/);
        });
        
        this.scope('tmpHook', function(){
          this.temporaryDefinition()
          .beforeSave(function(){
            return false;
          });
        });
        
        this.scope('tmpRelation', function(){
          this.temporaryDefinition()
          .hasMany('threads');
        });
        
        this.scope('tmpAttribute', function(){
          this.temporaryDefinition()
          .attribute('LOGIN', String)
          .convert('output', 'LOGIN', function(){
            return this.login.toUpperCase();
          })
        });
      });
      store.Model('Post', function(){
        this.belongsTo('user');
        this.belongsTo('thread');
      });
      store.Model('Thread', function(){
        this.belongsTo('user');
        this.hasMany('posts');
      });
    });
  
    
    it('adds a temporary validation', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.tmpValidation().create({
          login: 'max'
        }, function(result){
          result.should.be.false;
          next();
        });      
      });
    });
    
    
    it('does not pollute the model validation definition', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: 'max'
        }, function(result){
          result.should.be.true;
          next();
        });      
      });
    });
    
    
    
    it('adds a temporary beforeSave hook', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.tmpHook().create({
          login: 'max'
        }, function(result){
          result.should.be.false;
          next();
        });      
      });
    });
    
    
    it('does not pollute the model hooks definition', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: 'max'
        }, function(result){
          result.should.be.true;
          next();
        });      
      });
    });
    
    
    
    it('adds a temporary relation', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.tmpRelation().include('threads').exec(function(){
          next();
        })     
      });
    });
    
    
    it('does not pollute the model relations definition', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        (function(){
          User.include('threads').exec();
        }).should.throw();
        next();
      });
    });
    
    
    
    
    it('adds a temporary attribute', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.tmpAttribute().find(1).exec(function(user){
          user.LOGIN.should.be.equal('PHIL')
          next();
        });
      });
    });
    
    
    it('does not pollute the model relations definition', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1).exec(function(user){
          should.not.exist(user.LOGIN);
          next();
        });
      });
    });
     
  });
    
}  