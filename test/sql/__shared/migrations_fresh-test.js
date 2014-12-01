var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Migrations Fresh', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
  
    before(function(){
      store_conf.migrations = __dirname + '/../../fixtures/migrations/*';
      
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      store.Model('User', function(){});
      store.Model('Post', function(){});
      store.Model('Test', function(){});
      store.Model('AttributeTest', function(){});
    });
    
    
    
    
    it('are finished before ready() gets called', function(next){
      store.ready(function(){
        var User = store.Model('User');
        should.exist(User);
        next();
      });
    });
    
    
    it('has all attributes loaded', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.definition.attributes.should.have.property('id');
        User.definition.attributes.should.have.property('login');
        User.definition.attributes.should.have.property('first_name');
        User.definition.attributes.should.have.property('last_name');
        next();
      });
    });
    
    
    it('has a primary key', function(next){
      store.ready(function(){
        var User = store.Model('User');
        User.definition.primary_keys.length.should.be.equal(1);
        User.definition.primary_keys.should.be.eql(['id']);
        next();
      });
    });
    
    
    it('has not_null definition', function(next){
      store.ready(function(){
        var User = store.Model('User');
        
        User.definition.attributes.id.notnull.should.be.true;
        User.definition.attributes.login.notnull.should.be.true;
        User.definition.attributes.first_name.notnull.should.be.false;
        
        next();
      });
    });
    
    
    it('second migrations was executed as well', function(next){
      store.ready(function(){
        var Post = store.Model('Post');
        
        Post.definition.attributes.should.have.property('id');
        
        if(store.type == 'postgres' || store.type == 'mysql'){
          Post.definition.attributes.should.have.property('message');
        }else{
          Post.definition.attributes.should.have.property('messages'); //SQLite3 Support in knex is not yet finished
        }
        
        next();
      });
    });
    
    
    
    it('has the right data type', function(next){
      store.ready(function(){
        var AttributeTest = store.Model('AttributeTest');
        
        AttributeTest.definition.attributes.string_attr.type.name.should.be.equal('string');
        AttributeTest.definition.attributes.text_attr.type.name.should.be.equal('string');
        AttributeTest.definition.attributes.integer_attr.type.name.should.be.equal('integer');
        AttributeTest.definition.attributes.float_attr.type.name.should.be.equal('float');
        AttributeTest.definition.attributes.boolean_attr.type.name.should.be.equal('boolean');
        AttributeTest.definition.attributes.date_attr.type.name.should.be.equal('date');
        AttributeTest.definition.attributes.datetime_attr.type.name.should.be.equal('datetime');
        
        if(store.type == 'postgres' || store.type == 'mysql'){
          AttributeTest.definition.attributes.binary_attr.type.name.should.be.equal('binary');
          AttributeTest.definition.attributes.time_attr.type.name.should.be.equal('time');
        }else{
          AttributeTest.definition.attributes.binary_attr.type.name.should.be.equal('string'); //TODO: SHOULD BE binary
          AttributeTest.definition.attributes.time_attr.type.name.should.be.equal('string'); //TODO: SHOULD BE time
        }
        
        next();
      });
    });
    
    
    
    it('has all stampable() attributes', function(next){
      store.ready(function(){
        var Post = store.Model('Post');
        Post.definition.attributes.should.have.property('updated_at');
        Post.definition.attributes.should.have.property('created_at');
        Post.definition.attributes.should.have.property('updater_id');
        Post.definition.attributes.should.have.property('creator_id');
        next();
      });
    });
    
    
    it('has all polymorph() attributes', function(next){
      store.ready(function(){
        var Post = store.Model('Post');
        Post.definition.attributes.should.have.property('foo_id');
        Post.definition.attributes.should.have.property('foo_type');
        next();
      });
    });
    
    
    it('has all nestedSet() attributes', function(next){
      store.ready(function(){
        var Post = store.Model('Post');
        Post.definition.attributes.should.have.property('lft');
        Post.definition.attributes.should.have.property('rgt');
        Post.definition.attributes.should.have.property('depth');
        Post.definition.attributes.should.have.property('parent_id');
        next();
      });
    });
    
    
    it('has all paranoid() attributes', function(next){
      store.ready(function(){
        var Post = store.Model('Post');
        Post.definition.attributes.should.have.property('deleted_at');
        Post.definition.attributes.should.have.property('deleter_id');
        next();
      });
    });
    
    
    it('has created a view', function(next){
      store.ready(function(){
        var Test = store.Model('Test');
        
        Test.find(1).exec(function(user){
          user.login.should.be.equal('phil');
          next();
        });
      });
    });
    
    
    it('has seeded some records', function(next){
      store.ready(function(){
        var User = store.Model('User');
        
        User.find(1).exec(function(user){
          user.login.should.be.equal('phil');
          next();
        });
      });
    });
    
  });
};