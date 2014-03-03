var should = require('should');
var Helper = require('../../lib/stores/sql/helper');
var Store = require('../../lib/store');

describe('SQL: Helper', function(){
  var store = new Store({
    type: 'sql'    
  });
  
  store.Model('User', function(){
    this.attribute('my_id', Number, {primary: true});    
    this.hasMany('posts');
    this.hasMany('threads');
    this.hasMany('unread_posts');
    this.hasMany('unread', {through:'unread_posts'});
    this.hasMany('unread_threads', {through:'unread', relation:'thread'});
  });
  
  store.Model('Thread', function(){
    this.attribute('id', Number, {primary: true});    
    this.belongsTo('user');
    this.hasMany('posts');
  });
  
  store.Model('Post', function(){
    this.attribute('aid', Number, {primary: true});    
    this.belongsTo('user');
    this.belongsTo('thread');
  }); 
  
  store.Model('UnreadPost', function(){
    this.attribute('id', Number, {primary: true});
    this.belongsTo('user');
    this.belongsTo('unread', {model: 'Post'});
  });
  

  
  describe('sanitizeRelations()', function(){
    it('works with a single relation', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeRelations(User, 'posts');
        result.length.should.be.equal(1);
        result[0].name_tree.should.be.eql(['posts']);
        next();
      });      
    });
    
    
    it('works with a single relation as an array', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeRelations(User, ['posts']);
        result.length.should.be.equal(1);
        result[0].name_tree.should.be.eql(['posts']);
        next();
      });      
    }); 
    
    
    it('works with a multiple relations', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeRelations(User, ['posts', 'threads']);
        result.length.should.be.equal(2);
        result[0].name_tree.should.be.eql(['posts']);
        result[1].name_tree.should.be.eql(['threads']);
        next();
      });      
    }); 
    
    
    it('works with nested relations', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeRelations(User, {posts:'thread'});
        result.length.should.be.equal(2);
        result[0].name_tree.should.be.eql(['posts']);
        result[1].name_tree.should.be.eql(['posts', 'thread']);
        next();
      });      
    });
    
    
    it('works with nested relations as an array', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeRelations(User, ['posts', {threads:'posts'}]);
        result.length.should.be.equal(3);
        result[0].name_tree.should.be.eql(['posts']);
        result[1].name_tree.should.be.eql(['threads']);
        result[2].name_tree.should.be.eql(['threads', 'posts']);
        next();
      });      
    });
    
    it('works with deeply nested relations', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeRelations(User, ['posts', {threads:{posts: 'user'}}]);
        result.length.should.be.equal(4);
        result[0].name_tree.should.be.eql(['posts']);
        result[1].name_tree.should.be.eql(['threads']);
        result[2].name_tree.should.be.eql(['threads', 'posts']);
        result[3].name_tree.should.be.eql(['threads', 'posts', 'user']);
        next();
      });      
    });
    
    it('works with through relations', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeRelations(User, ['unread']);
        result.length.should.be.equal(2);
        result[0].name_tree.should.be.eql(['unread_posts']);
        result[1].name_tree.should.be.eql(['unread_posts', 'unread']);
        next();
      });      
    }); 
    
    it('works with nested relations and through', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeRelations(User, {threads:{user:'unread'}});
        result.length.should.be.equal(4);
        result[0].name_tree.should.be.eql(['threads']);
        result[1].name_tree.should.be.eql(['threads', 'user']);
        result[2].name_tree.should.be.eql(['threads', 'user', 'unread_posts']);
        result[3].name_tree.should.be.eql(['threads', 'user', 'unread_posts', 'unread']);
        next();
      });      
    }); 
    
    it('works with multiple through relations', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeRelations(User, ['unread_threads']);
        result.length.should.be.equal(3);
        result[0].name_tree.should.be.eql(['unread_posts']);
        should.not.exist(result[0].as);
        result[1].name_tree.should.be.eql(['unread_posts', 'unread']);
        should.not.exist(result[1].as);
        result[2].name_tree.should.be.eql(['unread_posts', 'unread', 'thread']);
        result[2].as.should.be.eql(['unread_threads']);
        next();
      });      
    });
    
    it('works with multiple nested through relations', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeRelations(User, {unread_threads:{user:'unread'}});
        result.length.should.be.equal(6);
        result[0].name_tree.should.be.eql(['unread_posts']);
        result[1].name_tree.should.be.eql(['unread_posts', 'unread']);
        result[2].name_tree.should.be.eql(['unread_posts', 'unread', 'thread']);
        result[2].as.should.be.eql(['unread_threads']);
        result[3].name_tree.should.be.eql(['unread_posts', 'unread', 'thread', 'user']);
        should.not.exist(result[3].as);
        result[4].name_tree.should.be.eql(['unread_posts', 'unread', 'thread', 'user', 'unread_posts']);
        should.not.exist(result[4].as);
        result[5].name_tree.should.be.eql(['unread_posts', 'unread', 'thread', 'user', 'unread_posts', 'unread']);
        result[5].as.should.be.eql(['unread_posts', 'unread', 'thread', 'user', 'unread']);
        next();
      });      
    });
  });


  describe('sanitizeCondition()', function(){
    it('works with a simple hash conditions', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeCondition(User, {login:'phil'});
        result.length.should.be.equal(1);
        result[0].name_tree.should.be.eql([]);
        result[0].table.should.be.eql('users');
        
        next();
      });      
    });
    
    it('works with a hasMany through relation', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeCondition(User, {unread_threads:{title_like:'first'}});
        result.length.should.be.equal(1);
        result[0].name_tree.should.be.eql(['unread_posts', 'unread', 'thread']);
        result[0].table.should.be.eql('threads');
        
        next();
      });      
    });
    
    it('works with null values', function(next){
      store.ready(function(){
        var User = store.Model('User');
        var result = Helper.sanitizeCondition(User, {title: null});
        result.length.should.be.equal(1);
        result[0].name_tree.should.be.eql([]);
        result[0].table.should.be.eql('users');
        (result[0].value === null).should.be.true;
        next();
      });      
    });
  });
  
});