var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Includes', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      store2 = new Store({
        type: 'rest',
        url: 'http://localhost:8889',
        version: '~1.0',
        name: 'IncludeRestStore'
      });
      
      
      store.Model('User', function(){
        this.hasMany('posts');
        this.hasMany('threads');
        this.hasOne('avatar');
        this.hasMany('unread_posts');
        this.hasMany('unread', {through:'unread_posts'});
        this.hasMany('unread_threads', {through:'unread', relation:'thread'});
        this.hasMany('poly_things');
        this.hasMany('members', {through:'poly_things', relation:'member'});
        
        this.belongsTo('user', {store: 'IncludeRestStore', primary_key:'id'});
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
      
      
    

      store2.Model('User', function(){
        this.attribute('id', Number, {primary: true});
        this.attribute('login', String);
        this.attribute('email', String);
        
        this.hasMany('posts');
      });
  
      store2.Model('Post', function(){
        this.attribute('id', Number, {primary: true});
        this.attribute('message', String);
        this.attribute('user_id', Number);
        this.attribute('thread_id', Number);
    
        this.belongsTo('user');
      });
    });
    
    
    
    
    
    describe('include()', function(){
    
      it('throws an error on unknown relation', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          (function(){
            User.include('unknown');
          }).should.throw();        
          next();
        });
      });
    
      it('throws an error on unknown nested relation', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          (function(){
            User.include({unknown: 'posts'})
          }).should.throw();        
          next();
        });
      });
    
      it('include does not join tables', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.include('posts').toSql().should.be.equal('select * from "users"');
          next();
        });
      });
    
    
      it('returns the right results on a simple include', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.include('posts').order('users.id').exec(function(result){
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
    
    
      it('returns the right results on multiple includes', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.include('posts', 'threads').order('users.id').exec(function(result){
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
    
    
      it('returns the right results on multiple nested includes', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.include({threads: 'posts'}).order('users.id').exec(function(result){
            result[0].login.should.be.equal('phil');
            result[0].posts.length.should.be.equal(0);
            result[0].threads.length.should.be.equal(1);
            result[0].threads[0].posts.length.should.be.equal(1);
            result[1].login.should.be.equal('michl');
            result[1].posts.length.should.be.equal(0);
            result[1].threads.length.should.be.equal(1);
            result[1].threads[0].posts.length.should.be.equal(3);
            result[2].login.should.be.equal('admin');
            result[2].posts.length.should.be.equal(0);
            result[2].threads.length.should.be.equal(0);
            next();
          });
        });
      });
    
    
      it('returns the right results on deep nested includes', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.include({threads: {posts:'user'}}).order('users.id').exec(function(result){
            result[0].login.should.be.equal('phil');
            result[0].posts.length.should.be.equal(0);
            result[0].threads.length.should.be.equal(1);
            result[0].threads[0].posts.length.should.be.equal(1);
            result[0].threads[0].posts[0].user.login.should.be.equal('phil');
            result[1].login.should.be.equal('michl');
            result[1].posts.length.should.be.equal(0);
            result[1].threads.length.should.be.equal(1);
            result[1].threads[0].posts.length.should.be.equal(3);
            result[2].login.should.be.equal('admin');
            result[2].posts.length.should.be.equal(0);
            result[2].threads.length.should.be.equal(0);
            next();
          });
        });
      });
    
    
      it('returns the right results on multiple nested includes and nested conditions', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          //joins the threads table....
          User.include({threads: 'posts'}).where({threads:{title_like:'first'}}).order('users.id').exec(function(result){
            result[0].login.should.be.equal('phil');
            result[0].posts.length.should.be.equal(0);
            result[0].threads.length.should.be.equal(0);
          
            result[1].login.should.be.equal('michl');
            result[1].posts.length.should.be.equal(0);
            result[1].threads.length.should.be.equal(1);
            result[1].threads[0].posts.length.should.be.equal(3);
            next();
          });
        });
      });
      
      
      it('returns the right results on multiple nested includes and nested conditions (attribute = attribute)', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          //joins the threads table....
          User.include({threads: 'posts'}).where({threads:{id:{attribute:'user_id'}}}).order('users.id').exec(function(result){
            result.length.should.be.equal(3);
            result[0].posts.length.should.be.equal(0);
            result[0].threads.length.should.be.equal(0);
            result[1].posts.length.should.be.equal(0);
            result[1].threads.length.should.be.equal(0);
            result[2].posts.length.should.be.equal(0);
            result[2].threads.length.should.be.equal(0);
            next();
          });
        });
      });
    
    
      it('Loads the user but no posts', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          //joins the threads table....
          User.include('posts').where({posts:{message_like:'unknown'}}).order('users.id').exec(function(result){
            result.length.should.be.equal(3);
            result[0].posts.length.should.be.equal(0);
            result[1].posts.length.should.be.equal(0);
            result[2].posts.length.should.be.equal(0);
            next();
          });
        });
      });
    
    
      it('Loads the user and their threads but no posts', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          //joins the threads table....
          User.include({threads: 'posts'}).where({threads:{posts:{message_like:'unknown'}}}).order('users.id').exec(function(result){
            result.length.should.be.equal(3);
            result[0].threads.length.should.be.equal(1);
            result[0].threads[0].posts.length.should.be.equal(0);
            result[1].threads.length.should.be.equal(1);
            result[1].threads[0].posts.length.should.be.equal(0);
            result[2].threads.length.should.be.equal(0);
            next();
          });
        });
      });
      
      
      it('returns the right results on hasOne relations', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.include('avatar').exec(function(result){
            result.length.should.be.equal(3);
            result[0].avatar.url.should.be.equal('http://awesome-avatar.com/avatar.png');
            should.not.exist(result[1].avatar);
            should.not.exist(result[2].avatar);
            next();
          });
        });
      });
      
      
      it('returns the right results on hasMany through', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.include('unread').order('users.id').exec(function(result){  
            result.length.should.be.equal(3);
            result[0].unread.length.should.be.equal(1);
            result[1].unread.length.should.be.equal(0);
            result[2].unread.length.should.be.equal(0);
            next();
          });
        });
      });
      
      
      it('returns the right results on nested hasMany through', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.include('unread_threads').order('users.id').exec(function(result){   
            result.length.should.be.equal(3);
            result[0].unread_threads.length.should.be.equal(1);
            result[0].unread_threads[0].title.should.be.equal('second thread');
            result[1].unread_threads.length.should.be.equal(0);
            result[2].unread_threads.length.should.be.equal(0);
            next();
          });
        });
      });
      
      it('returns the right results on belongsTo through', function(next){ 
        store.ready(function(){
          var Post = store.Model('Post');
          Post.include('thread_autor').order('posts.id').exec(function(result){
            result.length.should.be.equal(4);
            result[0].thread_autor.login.should.be.equal('michl');
            result[1].thread_autor.login.should.be.equal('michl');
            result[2].thread_autor.login.should.be.equal('phil');
            result[3].thread_autor.login.should.be.equal('michl');
            next();
          });
        });
      });
      
      
      it('returns the right results on sub nested hasMany through', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.include({threads:{user:'unread_threads'}}).order('users.id').exec(function(result){   
            result.length.should.be.equal(3);
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
          User.include({threads:{user:'unread_threads'}}).where({threads:{user:{unread_threads:{title_like:'unknown'}}}}).order('users.id').exec(function(result){
            result.length.should.be.equal(3);
            result[0].unread_threads.length.should.be.equal(0);
            result[1].unread_threads.length.should.be.equal(0);
            result[2].unread_threads.length.should.be.equal(0);
            
            result[0].threads.length.should.be.equal(1);
            result[1].threads.length.should.be.equal(1);            
            result[2].threads.length.should.be.equal(0);
            
            result[0].threads[0].user.unread_threads.length.should.be.equal(0);
            result[1].threads[0].user.unread_threads.length.should.be.equal(0); 
            
            next();
          });
        });
      });
      
      it('returns the right results on sub nested hasMany through with custom conditions', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.include({threads:{user:'unread_threads'}}).where({threads:{user:{unread_threads:["title like ?", 'second%']}}}).order('users.id').exec(function(result){
            result.length.should.be.equal(3);
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
      
      
      it('returns a polymorphic relation', function(next){
        store.ready(function(){
          var PolyThing = store.Model('PolyThing');
          var Post = store.Model('Post');
          var Thread = store.Model('Thread');
          var Avatar = store.Model('Avatar');
          PolyThing.include('member').order('poly_things.id').exec(function(result){
            result.length.should.be.equal(4);
            result[0].member.should.be.an.instanceOf(Post);
            result[1].member.should.be.an.instanceOf(Thread);
            result[2].member.should.be.an.instanceOf(Thread);
            result[3].member.should.be.an.instanceOf(Avatar);
            next();
          });
        });
      });
      
      
      it('returns a nested polymorphic relation', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Post = store.Model('Post');
          var Thread = store.Model('Thread');
          var Avatar = store.Model('Avatar');
          User.include({poly_things:'member'}).order('users.id').exec(function(result){
            result.length.should.be.equal(3);
            result[0].poly_things.length.should.be.equal(2);
            result[1].poly_things.length.should.be.equal(2);
            result[0].poly_things[0].member.should.be.an.instanceOf(Post);
            result[0].poly_things[1].member.should.be.an.instanceOf(Thread);
            result[1].poly_things[0].member.should.be.an.instanceOf(Thread);
            result[1].poly_things[1].member.should.be.an.instanceOf(Avatar);
            result[2].poly_things.length.should.be.equal(0);
            next();
          });
        });
      });
      
            
      it('returns a hasMany through polymorphic relation', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var Post = store.Model('Post');
          var Thread = store.Model('Thread');
          var Avatar = store.Model('Avatar');
          User.include('members').order('users.id').exec(function(result){
            result.length.should.be.equal(3);
            result[0].members.length.should.be.equal(2);
            result[1].members.length.should.be.equal(2);
            result[0].members[0].should.be.an.instanceOf(Post);
            result[0].members[1].should.be.an.instanceOf(Thread);
            result[1].members[0].should.be.an.instanceOf(Thread);
            result[1].members[1].should.be.an.instanceOf(Avatar);
            result[2].members.length.should.be.equal(0);
            next();
          });
        });
      });
       
       
      it('returns a hasMany through polymorphic relation with sub includes', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.include({members: ['user']}).order('users.id').exec(function(result){
            result.length.should.be.equal(3);
            result[0].members.length.should.be.equal(2);
            result[1].members.length.should.be.equal(2);
            result[0].members[0].user.login.should.be.equal('phil');
            result[0].members[1].user.login.should.be.equal('michl');
            result[1].members[0].user.login.should.be.equal('phil');
            result[1].members[1].user.login.should.be.equal('phil');
            result[2].members.length.should.be.equal(0);
            next();
          });
        });
      });
       
      it('returns a the polymorphic relation from the other side', function(next){
        store.ready(function(){
          var Avatar = store.Model('Avatar');
          Avatar.find(1).include('poly_things').exec(function(result){
            result.id.should.be.equal(1);
            result.poly_things.length.should.be.equal(1);
            result.poly_things[0].member_type.should.be.equal('Avatar');
            result.poly_things[0].member_id.should.be.equal(result.id);
            next();
          });
        });
      });
      
      
      
      it('returns the result + the totalCount', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.limit(2).include(':totalCount').exec(function(result){
            result.length.should.be.equal(2);
            result.$totalCount.should.be.equal(3);
            next();
          });
        });
      });
      
      
      it('returns the result + the totalCount with a join', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.join('posts').where({posts:{message_like: 'first'}}).include(':totalCount').exec(function(result){
            result.length.should.be.equal(1);
            result.$totalCount.should.be.equal(1);
            next();
          });
        });
      });
      
      
      it('returns the result + the totalCount of posts', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.include('posts:totalCount').exec(function(result){
            result.length.should.be.equal(3);
            result.posts$totalCount.should.be.equal(4);
            next();
          });
        });
      });
      
      it('returns the result as json + the totalCount', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.limit(2).include(':totalCount').asJson().exec(function(result){
            result.length.should.be.equal(2);
            this.$totalCount.should.be.equal(3);
            next();
          });
        });
      });
      
      it('returns the result + the totalCount with conditions', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.include(':totalCount').where({login_like: 'phil'}).exec(function(result){
            result.length.should.be.equal(1);
            result.$totalCount.should.be.equal(1);
            next();
          });
        });
      });
      
      
      it('returns the result + the totalCount with conditions and joins', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.include(':totalCount').join('posts').where({login_like: 'phil'}).exec(function(result){
            result.length.should.be.equal(1);
            result.$totalCount.should.be.equal(1);
            next();
          });
        });
      });
      
       
       
      it('does only one include, even include(table) was called twice', function(next){
        store.ready(function(){
          var Avatar = store.Model('Avatar');
          Avatar.find(1).include('poly_things').include('poly_things').exec(function(result){
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
       
       
      it('Include a cross store relation', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.include('user').exec(function(result){
            result.length.should.be.equal(3);
          
            result[0].id.should.be.equal(result[0].user.id);
            result[0].email.should.not.be.equal(result[0].user.email);
          
            next();
          }).catch(function(err){
            should.not.exist(err);
            next();
          });
        });
      });
      
      it('Include a cross store relation with a subrelation', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.include({user: 'posts'}).exec(function(result){
            result.length.should.be.equal(3);
            
            result[0].user.posts.length.should.be.equal(3);
            result[1].user.posts.length.should.be.equal(1);
          
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