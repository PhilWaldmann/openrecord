var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Allowed Attributes', function(){
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
        this.hasMany('threads');      
      });
      store.Model('Post', function(){
        this.belongsTo('user');
        this.belongsTo('thread', {dependent:'delete'});
      });
      store.Model('Thread', function(){
        this.belongsTo('user');
        this.hasMany('posts', {dependent:'delete'});
      });
      
    });
    
    
    it('converts records to normal objects with limited attributes', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.include('posts').exec(function(users){
          var res = users.toJson(['id', 'login']);

          res.should.be.eql([
            { id: 1, login: 'phil' },
            { id: 2, login: 'michl' },
            { id: 3, login: 'admin' }
          ]);
          
          next();
        });
      });
    });
    
    
    it('applies allowed_attriutes on asJson()', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.include('posts').asJson(['id', 'login']).exec(function(users){
          
          users.should.be.eql([
            { id: 1, login: 'phil' },
            { id: 2, login: 'michl' },
            { id: 3, login: 'admin' }
          ]);
          
          next();
        });
      });
    });
    
    it('applies typecasts on asJson()', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.include('posts').asJson().exec(function(users){
          
          users[0].active.should.be.equal(true);
          users[1].active.should.be.equal(false);
          users[2].active.should.be.equal(true);
          
          next();
        });
      });
    });
    
    
    it('applies typecasts and allowed_attributes on asJson()', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.include('posts').asJson(['id', 'active']).exec(function(users){
          
          users.should.be.eql([
            { id: 1, active: true },
            { id: 2, active: false },
            { id: 3, active: true }
          ]);
          
          next();
        });
      });
    });
    
    
  });
};