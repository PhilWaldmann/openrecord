var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Fibers', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    }); 
    
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      store.Model('User', function(){
        this.validatesPresenceOf('login');
        this.hasMany('posts');
      });
      
      store.Model('Post', function(){        
        
      });
    });
  
    
    it('find a single record', function(next){
      store.ready(function(){
        store.sync(function(){
          var Post = store.Model('Post');
        
          Post.find(1).exec().toJson().should.be.eql({id:1, user_id:1, thread_id:1, message:"first message"});
        
          next();
        });
      });
    });
    
    
    it('find a single record and get relational records after', function(next){
      store.ready(function(){
        store.sync(function(){
          var User = store.Model('User');
        
          var phil = User.find(1).exec();
          
          phil.posts.exec().length.should.be.equal(3);
        
          next();
        });
      });
    });
    
    
    it('find multiple records', function(next){
      store.ready(function(){
        store.sync(function(){
          var Post = store.Model('Post');
          
          Post.exec().toJson().should.be.eql([
            {id:1, user_id:1, thread_id:1, message:"first message"},
            {id:2, user_id:1, thread_id:1, message:"second"},
            {id:3, user_id:1, thread_id:2, message:"third"},
            {id:4, user_id:2, thread_id:1, message:"michls post"}
          ]);
          
          next();
        });
      });
    });
    
    
    it('do multiple finds', function(next){
      store.ready(function(){
        store.sync(function(){
          var Post = store.Model('Post');
          var User = store.Model('User');
          
          var post = Post.find(1).exec();
          var user = User.find(1).exec();
          
          post.message.should.be.equal('first message');
          user.login.should.be.equal('phil');
          
          next();
        });
      });
    });
    
    
    it('find, update and reload it again', function(next){
      store.ready(function(){
        store.sync(function(){
          var User = store.Model('User');
          
          var phil = User.find(1).exec();
          
          phil.email = 'philipp@mail.com';
          phil.save().should.be.equal(true);
          
          var philipp = User.find(1).exec();
          
          philipp.email.should.be.equal('philipp@mail.com');
          phil.should.not.be.equal(philipp);
          phil.toJson().should.be.eql(philipp.toJson());
             
          next();
        });
      });
    });
    
    
    it('combine sync with async´s series ...', function(next){
      store.ready(function(){                
        store.sync(function(){
          var User = store.Model('User');
          var Post = store.Model('Post');
          
          User.exec().each(function(user, index, done){
            Post.where({user_id: user.id}).exec(function(posts){
              posts.length.should.be.equal(user.id == 1 ? 3 : (user.id == 2 ? 1 : 0));
            
              done();
            });            
          }, function(){
            next();
          });
          
        });
      });
    });
        
    
    
    it('find, destroy and try to load it again', function(next){
      store.ready(function(){
        store.sync(function(){
          var User = store.Model('User');
          
          var phil = User.find(1).exec();
          
          phil.destroy().should.be.equal(true);
          
          var philipp = User.find(1).exec();
          
          should.not.exist(philipp);
             
          next();
        });
      });
    });
    
    
    
    it('find and create', function(next){
      store.ready(function(){
        store.sync(function(){
          var User = store.Model('User');
          
          User.where({login: 'phil'}).exec().length.should.be.equal(0);
          
          User.create({
            login: 'phil',
            email: 'phil@mail.com'
          });
          
          User.where({login: 'phil'}).exec().length.should.be.equal(1);
             
          next();
        });
      });
    });
    
    
    
    it('multiple sync statements in parallel', function(next){
      store.ready(function(){
        
        var jobs = 0;
        var done = function(job){
          if(job === 1){
            jobs.should.not.be.equal(0); //check if another job was finished first
          }
          jobs ++;
          if(jobs === 3) next(); //dirty
        }
        
        store.sync(function(){
          var Post = store.Model('Post');
          var User = store.Model('User');
          
          var post = Post.find(4).asJson().exec();
          post.should.be.eql({id: 4, message: 'michls post', thread_id:1, user_id: 2});
          
          var user = User.find(post.user_id).include('posts').exec();
          
          user.login.should.be.equal('michl');
          user.posts.length.should.be.equal(1);

          done(1);
        });
        
        
        store.sync(function(){
          var User = store.Model('User');
          User.where({login: 'phil'}).exec().length.should.be.equal(1);  

          done(2);
        });
        
        
        store.sync(function(){
          var User = store.Model('User');
          User.where({login: 'michl'}).exec().length.should.be.equal(1);  

          done(3);
        });
        
        
      });
    });
    
    
    
    it('wont save record with validation errors', function(next){
      store.ready(function(){
        store.sync(function(){
          var User = store.Model('User');

          var nobody = User.new({
            email: 'nobody@mail.com'
          });
          
          nobody.save().should.be.equal(false);
          nobody.errors.should.be.eql({ login: [ 'not valid' ] });          
          
          next();
        });
      });
    });
    
    
    it('throws an error on unknown record (try-catch)', function(next){
      store.ready(function(){
        store.sync(function(){
          var Post = store.Model('Post');
          try{
            Post.get(99).exec();
            should.not.exist('Success');
          }catch(e){
            should.exist(e);
          }
          next();
        });
      });
    });
    
          
  });
    
}  