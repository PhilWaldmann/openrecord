var should = require('should');

var Store = require('../../lib/store');

describe('SQL: Relations', function(){
  var store;

  before(function(){
    store = new Store({
      type: 'sql',
      name: 'MyStore'
    });

    store2 = new Store({
      type: 'sql',
      name: 'MyStore2'
    });

    store.Model('User', function(){
      this.attribute('id', Number, {primary: true});
      this.hasMany('posts');
      this.hasMany('bar', {model:'Foo'});
      this.belongsTo('user', {store:'MyStore2'});
    });
    store.Model('Post', function(){
      this.attribute('id', Number, {primary: true});
      this.attribute('user_id', Number);
      this.attribute('foo_id', Number);
      this.attribute('bazinga_id', Number);
      this.belongsTo('user');
      this.belongsTo('bar', {model:'Foo'});
      this.belongsTo('bazinga', {model:'Baz'});
    });

    store.Model('Foo', function(){
      this.attribute('id', Number, {primary: true});
      this.attribute('user_id', Number);
    });

    store.Model('Baz', function(){
      this.attribute('id', Number, {primary: true});
    });





    store2.Model('User', function(){
      this.attribute('id', Number, {primary: true});
      this.attribute('user_id', Number);

      this.belongsTo('user', {store:'MyStore'});
    });
  });


  it('hasMany() has the right foreign key', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.definition.relations.posts.foreign_key.should.be.equal('user_id');
      next();
    });
  });

  it('hasMany() has the right primary key', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.definition.relations.posts.primary_key.should.be.equal('id');
      next();
    });
  });

  it('hasMany() with custom model has the right foreign key', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.definition.relations.bar.foreign_key.should.be.equal('user_id');
      next();
    });
  });

  it('hasMany() with custom model has the right primary key', function(next){
    store.ready(function(){
      var User = store.Model('User');
      User.definition.relations.bar.primary_key.should.be.equal('id');
      next();
    });
  });

  it('belongsTo() has the right foreign key', function(next){
    store.ready(function(){
      var Post = store.Model('Post');
      Post.definition.relations.user.foreign_key.should.be.equal('id');
      next();
    });
  });

  it('belongsTo() has the right primary key', function(next){
    store.ready(function(){
      var Post = store.Model('Post');
      Post.definition.relations.user.primary_key.should.be.equal('user_id');
      next();
    });
  });

  it('belongsTo() with custom model has the right foreign key', function(next){
    store.ready(function(){
      var Post = store.Model('Post');
      Post.definition.relations.bar.foreign_key.should.be.equal('id');
      next();
    });
  });

  it('belongsTo() with custom model has the right primary key', function(next){
    store.ready(function(){
      var Post = store.Model('Post');
      Post.definition.relations.bar.primary_key.should.be.equal('foo_id');
      next();
    });
  });

  it('belongsTo() with custom model and same field name has the right foreign key', function(next){
    store.ready(function(){
      var Post = store.Model('Post');
      Post.definition.relations.bazinga.foreign_key.should.be.equal('id');
      next();
    });
  });

  it('belongsTo() with custom model and same field name has the right primary key', function(next){
    store.ready(function(){
      var Post = store.Model('Post');
      Post.definition.relations.bazinga.primary_key.should.be.equal('bazinga_id');
      next();
    });
  });

  it('belongsTo() with cross store relation', function(next){
    store.ready(function(){
      var User = store.Model('User');
      var User2 = store2.Model('User');
      (User2.definition.relations.user.model === User).should.be.equal(true);
      next();
    });
  });

  it('belongsTo() with cross store relation from the other side', function(next){
    store.ready(function(){
      var User = store.Model('User');
      var User2 = store2.Model('User');
      (User.definition.relations.user.model === User2).should.be.equal(true);
      next();
    });
  });


  it('should not create a relation if the store is not available', function(next){
    var tmp = new Store({
      type: 'sql'
    });

    tmp.Model('Foo', function(){
      this.belongsTo('bar', {store:'UNKNOWN'});
    });

    tmp.ready(function(){
      var Foo = tmp.Model('Foo')
      should.not.exists(Foo.definition.relations.bar);
      next();
    })

  });


  it('should wait until the requested store is available', function(next){
    var tmp = new Store({
      type: 'sql'
    });

    tmp.Model('Foo', function(){
      this.belongsTo('bar', {store:'OTHER'});
    });

    var tmp2 = new Store({
      type: 'sql',
      name: 'OTHER'
    });

    tmp2.Model('Bar', function(){});


    tmp.ready(function(){
      var Foo = tmp.Model('Foo')
      process.nextTick(function(){
        should.exists(Foo.definition.relations.bar);
        next();
      });
    });

  });

});
