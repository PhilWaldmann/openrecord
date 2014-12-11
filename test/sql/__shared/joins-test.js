var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Joins', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      store.Model('User', function(){
        this
        .hasMany('posts')
        .hasMany('threads')
        .hasOne('avatar')
        .hasMany('unread_posts')
        .hasMany('unread', {through:'unread_posts'})
        .hasMany('unread_threads', {through:'unread', relation:'thread'});
      });
      store.Model('Avatar', function(){
        this.belongsTo('user');
        this.hasMany('poly_things', {as:'member'});
      });
      store.Model('Post', function(){
        this.belongsTo('user');
        this.belongsTo('thread');
        this.belongsTo('thread_autor', {through:'thread', relation:'user'});
      });
      store.Model('Thread', function(){
        this.belongsTo('user');
        this.hasMany('posts');
      });
      store.Model('UnreadPost', function(){
        this.belongsTo('user');
        this.belongsTo('unread', {model: 'Post'});
      });
      store.Model('PolyThing', function(){
        this.belongsTo('member', {polymorph: true});
      });
    });
    
    
    
    
  
  
    describe('join()', function(){
    
      it('throws an error on unknown relation', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          (function(){
            User.join('unknown');
          }).should.throw();        
          next();
        });
      });
    
      it('throws an error on unknown nested relation', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          (function(){
            User.join({unknown: 'posts'})
          }).should.throw();        
          next();
        });
      });
    
      it('join returns the right sql', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join('posts').toSql().should.be.equal('select "users"."id" as "f0", "users"."login" as "f1", "users"."email" as "f2", "users"."created_at" as "f3", "posts"."id" as "f4", "posts"."user_id" as "f5", "posts"."thread_id" as "f6", "posts"."message" as "f7" from "users" left join "posts" on "users"."id" = "posts"."user_id"');
          next();
        });
      });
    
    
      it('leftJoin returns the right sql', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.leftJoin('posts').toSql().should.be.equal('select "users"."id" as "f0", "users"."login" as "f1", "users"."email" as "f2", "users"."created_at" as "f3", "posts"."id" as "f4", "posts"."user_id" as "f5", "posts"."thread_id" as "f6", "posts"."message" as "f7" from "users" left join "posts" on "users"."id" = "posts"."user_id"');
          next();
        });
      });
    
    
      it('rightJoin returns the right sql', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.rightJoin('posts').toSql().should.be.equal('select "users"."id" as "f0", "users"."login" as "f1", "users"."email" as "f2", "users"."created_at" as "f3", "posts"."id" as "f4", "posts"."user_id" as "f5", "posts"."thread_id" as "f6", "posts"."message" as "f7" from "users" right join "posts" on "users"."id" = "posts"."user_id"');
          next();
        });
      });
    
    
      it('innerJoin returns the right sql', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.innerJoin('posts').toSql().should.be.equal('select "users"."id" as "f0", "users"."login" as "f1", "users"."email" as "f2", "users"."created_at" as "f3", "posts"."id" as "f4", "posts"."user_id" as "f5", "posts"."thread_id" as "f6", "posts"."message" as "f7" from "users" inner join "posts" on "users"."id" = "posts"."user_id"');
          next();
        });
      });
    
    
      it('outerJoin returns the right sql', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.outerJoin('posts').toSql().should.be.equal('select "users"."id" as "f0", "users"."login" as "f1", "users"."email" as "f2", "users"."created_at" as "f3", "posts"."id" as "f4", "posts"."user_id" as "f5", "posts"."thread_id" as "f6", "posts"."message" as "f7" from "users" outer join "posts" on "users"."id" = "posts"."user_id"');
          next();
        });
      });
    
    
      it('join returns the right sql (type=right)', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join('posts', 'right').toSql().should.be.equal('select "users"."id" as "f0", "users"."login" as "f1", "users"."email" as "f2", "users"."created_at" as "f3", "posts"."id" as "f4", "posts"."user_id" as "f5", "posts"."thread_id" as "f6", "posts"."message" as "f7" from "users" right join "posts" on "users"."id" = "posts"."user_id"');
          next();
        });
      });
    
    
      it('join with a belongsTo relation', function(next){ 
        store.ready(function(){
          var Post = store.Model('Post');
          Post.join('user').toSql().should.be.equal('select "posts"."id" as "f0", "posts"."user_id" as "f1", "posts"."thread_id" as "f2", "posts"."message" as "f3", "user"."id" as "f4", "user"."login" as "f5", "user"."email" as "f6", "user"."created_at" as "f7" from "posts" left join "users" as "user" on "posts"."user_id" = "user"."id"');
          next();
        });
      });
    
    
      it('join returns the right sql (nested arrays)', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join([['posts']]).toSql().should.be.equal('select "users"."id" as "f0", "users"."login" as "f1", "users"."email" as "f2", "users"."created_at" as "f3", "posts"."id" as "f4", "posts"."user_id" as "f5", "posts"."thread_id" as "f6", "posts"."message" as "f7" from "users" left join "posts" on "users"."id" = "posts"."user_id"');
          next();
        });
      });
    
    
      it('returns the right results', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join('posts').order('users.id').exec(function(result){
            result[0].login.should.be.equal('phil');
            result[0].posts.length.should.be.equal(3);
            result[1].login.should.be.equal('michl');
            result[1].posts.length.should.be.equal(1);
            result[2].login.should.be.equal('admin');
            result[2].posts.length.should.be.equal(0);
            next();
          });
        });
      });
      
      
      it('returns null values as well', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(4).join('posts').exec(function(marlene){
            marlene.posts[0].attributes.should.have.property('message');
            next();
          });
        });
      });
      
      it('returns false values as well', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(4).join('threads').exec(function(marlene){
            marlene.threads[0].attributes.should.have.property('archived');
            marlene.threads[0].archived.should.be.false;
            next();
          });
        });
      });
    
    
      it('returns the right results on multiple joins', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join('posts', 'threads').order('users.id').exec(function(result){
            result[0].login.should.be.equal('phil');
            result[0].posts.length.should.be.equal(3);
            result[0].threads.length.should.be.equal(1);
            result[1].login.should.be.equal('michl');
            result[1].posts.length.should.be.equal(1);
            result[1].threads.length.should.be.equal(1);
            result[2].login.should.be.equal('admin');
            result[2].posts.length.should.be.equal(0);
            result[2].threads.length.should.be.equal(0);
            next();
          });
        });
      });
    
    
      it('returns the right results on nested joins aaa', function(next){ 
        store.ready(function(){
          var Thread = store.Model('Thread');
          Thread.join({posts: 'user'}).order('title').exec(function(result){   
            result[0].title.should.be.equal('first thread');
            result[0].posts.length.should.be.equal(3);
            result[0].posts[0].user.login.should.be.equal('phil');
            result[0].posts[1].user.login.should.be.equal('phil');
            result[0].posts[2].user.login.should.be.equal('michl');
            result[1].title.should.be.equal('second thread');
            result[1].posts.length.should.be.equal(1);
            result[1].posts[0].user.login.should.be.equal('phil');    
            next();
          });
        });
      });
    
    
      it('returns the right results on nested joins with the same table twice', function(next){ 
        store.ready(function(){
          var Thread = store.Model('Thread');
          Thread.join({posts: 'user'}, 'user').order('title', 'user.id').exec(function(result){   
            result[0].title.should.be.equal('first thread');
            result[0].posts.length.should.be.equal(3);
            result[0].posts[0].user.login.should.be.equal('phil');
            result[0].posts[1].user.login.should.be.equal('phil');
            result[0].posts[2].user.login.should.be.equal('michl');
            result[0].user.login.should.be.equal('michl');
            result[1].title.should.be.equal('second thread');
            result[1].posts.length.should.be.equal(1);
            result[1].posts[0].user.login.should.be.equal('phil');   
            result[1].user.login.should.be.equal('phil'); 
            next();
          });
        });
      });
    
    
      it('returns the right results on nested joins with nested conditions', function(next){ 
        store.ready(function(){
          var Thread = store.Model('Thread');
          Thread.join({posts: 'user'}, 'user').where({posts:{user:{login_like:'phi'}}}, {title_like: 'first'}).order('title', 'user.id').exec(function(result){          
            result[0].title.should.be.equal('first thread');
            result[0].posts.length.should.be.equal(2);
            result[0].posts[0].user.login.should.be.equal('phil');
            result[0].posts[1].user.login.should.be.equal('phil');
            result[0].user.login.should.be.equal('michl');
            should.not.exist(result[1]);
            next();
          });
        });
      });
      
      
      it('returns the right results on multiple nested joins and nested conditions (attribute = attribute)', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join({threads: 'posts'}).where({threads:{posts:{id:{attribute:'user_id'}}}}).order('users.id').exec(function(result){
            result.length.should.be.equal(1);
            result[0].threads[0].posts[0].id.should.be.equal(result[0].threads[0].posts[0].user_id);           
            next();
          });
        });
      });
      
      
      it('returns the right results on multiple nested joins and nested conditions (attribute = other_table.attribute)', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join({threads: 'posts'}).where({threads:{posts:{id:{attribute:'id', relation:'threads'}}}}).order('users.id').exec(function(result){
            result.length.should.be.equal(1);
            result[0].threads[0].posts[0].id.should.be.equal(result[0].threads[0].posts[0].user_id);           
            next();
          });
        });
      });
      
    
      it('returns the right results on deep nested joins with nested conditions', function(next){ 
        store.ready(function(){
          var Thread = store.Model('Thread');
          Thread.join({posts: {user:'posts'}}, 'user').where({posts:{user:{login_like:'phi'}}}, {title_like: 'first'}).order('title', 'user.id').exec(function(result){   
            result[0].title.should.be.equal('first thread');
            result[0].posts.length.should.be.equal(2);
            result[0].posts[0].user.login.should.be.equal('phil');
            result[0].posts[1].user.login.should.be.equal('phil');
            result[0].posts[0].user.posts.length.should.be.equal(3);
            result[0].user.login.should.be.equal('michl');
            should.not.exist(result[1]);
            next();
          });
        });
      });
      
      it('returns the right results on deep nested joins with nested conditions (attribute = other_table.attribute)', function(next){ 
        store.ready(function(){
          var Thread = store.Model('Thread');
          Thread.join({posts: {user:'posts'}}, 'user').where({posts:{user:{posts:{user_id:{attribute:'user_id', relation:'posts'}}}}}).order('title', 'user.id').exec(function(result){  
            result.length.should.be.equal(2);
            result[0].posts[0].user_id.should.be.equal(result[0].posts[0].user.posts[0].user_id);
            next();
          });
        });
      });
      
      
      it('returns the right results on hasOne relations', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join('avatar').exec(function(result){   
            result.length.should.be.equal(4);
            result[0].avatar.url.should.be.equal('http://awesome-avatar.com/avatar.png');
            should.not.exist(result[1].avatar);
            should.not.exist(result[2].avatar);
            should.not.exist(result[3].avatar);
            next();
          });
        });
      });
     
      it('returns the right results on hasMany through', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join('unread').order('users.id').exec(function(result){   
            result.length.should.be.equal(4);
            result[0].unread.length.should.be.equal(1);
            result[1].unread.length.should.be.equal(0);
            result[2].unread.length.should.be.equal(0);
            result[3].unread.length.should.be.equal(0);
            next();
          });
        });
      });
      
      
      it('returns the right results on nested hasMany through', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join('unread_threads').order('users.id').exec(function(result){   
            result.length.should.be.equal(4);
            result[0].unread_threads.length.should.be.equal(1);
            result[0].unread_threads[0].title.should.be.equal('second thread');
            result[1].unread_threads.length.should.be.equal(0);
            result[2].unread_threads.length.should.be.equal(0);
            result[3].unread_threads.length.should.be.equal(0);
            next();
          });
        });
      });
      
      it('returns the right results on belongsTo through', function(next){ 
        store.ready(function(){
          var Post = store.Model('Post');
          Post.join('thread_autor').order('posts.id').exec(function(result){
            result.length.should.be.equal(5);
            result[0].thread_autor.login.should.be.equal('michl');
            result[1].thread_autor.login.should.be.equal('michl');
            result[2].thread_autor.login.should.be.equal('phil');
            result[3].thread_autor.login.should.be.equal('michl');
            should.not.exist(result[4].thread_autor);
            next();
          });
        });
      });
      
      
      it('returns the right results on sub nested hasMany through', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join({threads:{user:'unread_threads'}}).order('users.id').exec(function(result){   
            result.length.should.be.equal(4);
            result[0].unread_threads.length.should.be.equal(0);
            result[1].unread_threads.length.should.be.equal(0);
            result[2].unread_threads.length.should.be.equal(0);
            
            result[0].threads.length.should.be.equal(1);
            result[1].threads.length.should.be.equal(1);            
            result[2].threads.length.should.be.equal(0);
            
            result[0].threads[0].user.unread_threads.length.should.be.equal(1);
            result[1].threads[0].user.unread_threads.length.should.be.equal(0); 
            
            next();
          });
        });
      });
      
      
      it('returns the right results on sub nested hasMany through with conditions', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.join({threads:{user:'unread_threads'}}).where({threads:{user:{unread_threads:{title_like:'second'}}}}).order('users.id').exec(function(result){
            result.length.should.be.equal(1);
            result[0].unread_threads.length.should.be.equal(0);
            
            result[0].threads.length.should.be.equal(1);
            
            result[0].threads[0].user.unread_threads.length.should.be.equal(1);
            
            next();
          });
        });
      });
      
      
      it('throws an error on polymorphic join', function(next){
        store.ready(function(){
          var PolyThing = store.Model('PolyThing');
          (function(){
            PolyThing.join('member');
          }).should.throw();
          next();
        });
      });
      
      it('returns a the polymorphic relation from the other side', function(next){
        store.ready(function(){
          var Avatar = store.Model('Avatar');
          Avatar.find(1).join('poly_things').exec(function(result){
            result.id.should.be.equal(1);
            result.poly_things.length.should.be.equal(1);
            result.poly_things[0].member_type.should.be.equal('Avatar');
            result.poly_things[0].member_id.should.be.equal(result.id);
            next();
          });
        });
      });
      
      
      it('does only one join, even join(table) was called twice', function(next){
        store.ready(function(){
          var Avatar = store.Model('Avatar');
          Avatar.find(1).join('poly_things').join('poly_things').exec(function(result){
            result.id.should.be.equal(1);
            result.poly_things.length.should.be.equal(1);
            result.poly_things[0].member_type.should.be.equal('Avatar');
            result.poly_things[0].member_id.should.be.equal(result.id);
            next();
          }).catch(function(err){
            should.not.exist(err);
            next();
          });
        });
      });
     
    });
    
    
  });
};