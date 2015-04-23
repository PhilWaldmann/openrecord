var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Collection', function(){
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
        this.hasOne('avatar');
        this.hasMany('unread_posts');
        this.hasMany('unread', {through:'unread_posts'});
        this.hasMany('unread_threads', {through:'unread', relation:'thread'});
        this.hasMany('poly_things', {as:'member'});
      });
      store.Model('Avatar', function(){
        this.belongsTo('user');
      });
      store.Model('Post', function(){
        this.belongsTo('user');
        this.belongsTo('thread');
        this.belongsTo('thread_autor', {through:'thread', relation:'user'});
        this.hasMany('poly_things', {as:'member'});
      });
      store.Model('Thread', function(){
        this.belongsTo('user');
        this.hasMany('posts');
        this.hasMany('poly_things', {as:'member'});
      });
      store.Model('UnreadPost', function(){
        this.belongsTo('user');
        this.belongsTo('unread', {model: 'Post'});
      });
      store.Model('PolyThing', function(){
        this.belongsTo('member', {polymorph: true});
      });
      
    });
    
    
    
    it('create a relational record with relation.create()', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1).include('posts').exec(function(user){
          user.posts.length.should.be.equal(3);
          
          user.posts.create({thread_id:1, message: 'another post'}, function(success){
            success.should.be.true;
            this.id.should.be.equal(5);
            this.user_id.should.be.equal(user.id);
            next();
          });
        });
      });
    });
    
    it('create a relational record with relation.add()', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Post = store.Model('Post');
        User.find(2).include('posts').exec(function(user){
          user.posts.length.should.be.equal(1);
          
          user.posts.add(Post.new({thread_id:1, message: 'yet another post'}));
          
          user.save(function(success){
            Post.where({user_id:user.id}).count().exec(function(result){
              result.should.be.equal(2);
              next();
            });
          });
        });
      });
    });
    
    
    it('create multiple relational records with relation.new()', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Post = store.Model('Post');
        User.find(3).include('posts').exec(function(user){
          user.posts.length.should.be.equal(0);
          
          user.posts.new({thread_id:1, message: 'michls post2'});
          user.posts.new({thread_id:1, message: 'post 3'});
          
          user.save(function(success){
            Post.where({user_id:user.id}).count().exec(function(result){
              result.should.be.equal(2);
              next();
            });
          });
        });
      });
    });
    
    
    it('create multiple relational records with relation = record', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Post = store.Model('Post');
        User.find(4).include('posts').exec(function(user){
          user.posts.length.should.be.equal(0);
          
          user.posts = Post.new({thread_id:1, message: 'with ='})
          
          user.save(function(success){
            Post.where({user_id:user.id}).count().exec(function(result){
              result.should.be.equal(1);
              next();
            });
          });
        });
      });
    });
    
    it('create multiple relational records with relation = record', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Post = store.Model('Post');
        User.find(5).include('posts').exec(function(user){
          user.posts.length.should.be.equal(0);
          
          user.posts = [Post.new({thread_id:1, message: 'with = [] 1'}), Post.new({thread_id:1, message: 'with = [] 2'})]
          
          user.save(function(success){
            Post.where({user_id:user.id}).count().exec(function(result){
              result.should.be.equal(2);
              next();
            });
          });
        });
      });
    });
    
    
    it('set a belongs_to record with =', function(next){ 
      store.ready(function(){
        var Thread = store.Model('Thread');
        var User = store.Model('User');
        Thread.find(1).exec(function(thread){
          
          thread.user = User.new({login:'new_user', email:'new_user@mail.com'});
          
          thread.save(function(success){
            success.should.be.true;

            User.where({login: 'new_user'}).include('threads').limit(1).exec(function(user){
              user.email.should.be.equal('new_user@mail.com');
              user.threads.length.should.be.equal(1);
              next();
            });
          });
        });
      });
    });
    
    
    it('set a hasOne record with =', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Avatar = store.Model('Avatar');
        User.find(1).exec(function(user){
          
          user.avatar = Avatar.new({url:'http://better-avatar.com/strong.png'});
          user.save(function(success){
            success.should.be.true;
            Avatar.where({url_like: 'better'}).include('user').limit(1).exec(function(avatar){
              avatar.url.should.be.equal('http://better-avatar.com/strong.png');
              avatar.user.id.should.be.equal(user.id);
              next();
            });
          });
        });
      });
    });
    
    
    it('add multiple records on a hasMany through relation via add(1, 2)', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Post = store.Model('Post');
        User.find(1).exec(function(user){
          
          user.unread.add([1, 2]);
          
          user.save(function(success){
            success.should.be.true;
            User.find(1).include('unread').exec(function(phil){
              phil.unread.length.should.be.equal(3);
              next();
            });
          });
        });
      });
    });
    
    
    it('add a records on a hasMany through relation via new()', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Post = store.Model('Post');
        User.find(2).include('unread').exec(function(user){
          user.unread.length.should.be.equal(0);
          
          user.unread.new({thread_id:3, user_id:3, message: 'unread message'});
          
          user.save(function(success){
            success.should.be.true;
            User.find(2).include('unread').exec(function(michl){
              michl.unread.length.should.be.equal(1);
              user.unread[0].attributes.user_id.should.be.equal(3);
              user.unread[0].attributes.thread_id.should.be.equal(3);
              user.unread[0].attributes.message.should.be.equal('unread message');
              next();
            });
          });
        });
      });
    });
    
    
    it('add multiple records on a hasMany through relation via unread_ids = [1, 2]', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        var Post = store.Model('Post');
        User.find(4).exec(function(user){
          
          user.unread_ids = [1, 2];
          
          user.save(function(success){
            success.should.be.true;
            User.find(4).include('unread').exec(function(user){
              user.unread.length.should.be.equal(2);
              next();
            });
          });
        });
      });
    });
    
    it('creates a new record with subrecords defined as unread_ids=[]', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.create({
          login: 'A',
          email: 'A@mail.com',
          unread_ids:[2, 3, 4]
        }, function(result){
          result.should.be.equal(true);
        
          User.where({login:'A'}).include('unread').limit(1).exec(function(result){
            result.login.should.be.equal('A');
            result.unread.length.should.be.equal(3);
            next();
          });
        
        });  
      });
    });
    
    
    it.skip('updates a record`s has_many relation with thread_ids=[1, 2]', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(1).include('threads').exec(function(user){

          user.thread_ids = [1, 2];

          user.save(function(success){
            success.should.be.true;
            User.find(1).include('threads').exec(function(phil){
              phil.threads.length.should.be.equal(2);
              next();
            });
          });
        });
      });
    });
    
    
    it('load all related records via exec()', function(next){ 
      store.ready(function(){
        var User = store.Model('User');
        User.find(3).exec(function(user){
          user.threads.exec(function(threads){
            threads.length.should.be.equal(1);
            next();
          });
        });
      });
    });
    
    
    
    
    it('adds a polymorphic record', function(next){ 
      store.ready(function(){
        var User = store.Model('User');

        User.find(1).exec(function(user){
          
          user.poly_things.new({message: 'foo'});

          user.save(function(success){
            success.should.be.true;
            User.find(1).include('poly_things').exec(function(phil){
              phil.poly_things.length.should.be.equal(1);
              phil.poly_things[0].message.should.be.eql('foo');
              next();
            });
          });
        });
      });
    });
        
  });
};