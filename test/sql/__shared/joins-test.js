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
        this.hasMany('posts');
        this.hasMany('threads');
        this.hasOne('avatar');
      });
      store.Model('Avatar', function(){
        this.belongsTo('user');
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
          Post.join('user').toSql().should.be.equal('select "posts"."id" as "f0", "posts"."user_id" as "f1", "posts"."thread_id" as "f2", "posts"."message" as "f3", "users"."id" as "f4", "users"."login" as "f5", "users"."email" as "f6", "users"."created_at" as "f7" from "posts" left join "users" on "posts"."user_id" = "users"."id"');
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
    
    
      it('returns the right results on nested joins', function(next){ 
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
          Thread.join({posts: 'user'}, 'user').order('title', 'users.id').exec(function(result){   
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
          Thread.join({posts: 'user'}, 'user').where({posts:{user:{login_like:'phi'}}}, {title_like: 'first'}).order('title', 'users.id').exec(function(result){          
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
    
    
      it('returns the right results on deep nested joins with nested conditions', function(next){ 
        store.ready(function(){
          var Thread = store.Model('Thread');
          Thread.join({posts: {user:'posts'}}, 'user').where({posts:{user:{login_like:'phi'}}}, {title_like: 'first'}).order('title', 'users.id').exec(function(result){   
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
     
    });
    
    
  });
};