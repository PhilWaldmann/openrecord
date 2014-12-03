var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Conditions', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    }); 
    
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);

      store.Model('User', function(){
        this.attribute('created_at', 'date');
      });
    });
  
     
    
  
  
    describe('find()', function(){
      /*
      it('finds with one id returns the right sql', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find(1).toSql().should.be.equal('select * from "users" where "users"."id" = 1 limit 1');
          next();
        });
      });
    */
    
      it('finds nothing', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.find(99).exec(function(result){
            should.not.exist(result);
            next();
          });
        });      
      });
    
    
      it('finds phil with id 1', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.find(1).exec(function(result){
            result.login.should.be.equal('phil');
            next();
          });
        });      
      });
    
      it('finds phil with id 1 (without exec)', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.find(1, function(result){
            result.login.should.be.equal('phil');
            next();
          });
        });      
      });
    
      /*
      it('finds with multiple ids returns the right sql', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.find([1, 2]).toSql().should.be.equal('select * from "users" where "users"."id" in (1, 2)');
          next();
        });
      });
    */
    
      it('finds phil and michl by id', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.find([1, 2]).exec(function(result){
            result.length.should.be.equal(2);
            result[0].login.should.be.equal('phil');
            result[1].login.should.be.equal('michl');
            next();
          });
        });      
      });
    
    
      it('finds phil and michl by id with reverse order', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.find([1, 2]).order('id', true).exec(function(result){
            result.length.should.be.equal(2);
            result[0].login.should.be.equal('michl');
            result[1].login.should.be.equal('phil');
            next();
          });
        });      
      });
        
    });
  
  
  
  
  
    describe('get()', function(){
      /*
      it('finds with one id returns the right sql', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.get(1).toSql().should.be.equal('select * from "users" where "users"."id" = 1 limit 1');
          next();
        });
      });
    */
    
      it('finds someting', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.get(1).exec(function(result){
            should.exist(result);
            next();
          });
        });      
      });
    
      it('returns a RecordNotFound error', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.get(99).exec(function(result){
            should.not.exist(result);
          }).catch(function(err){
            err.should.be.an.instanceOf(Error);
            next();
          });        
        });      
      });
      
        
    });
  
  
    describe('limit()', function(){
      it('finds the first 2 users', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.limit(2).order('id').exec(function(users){
            users.length.should.be.equal(2);
            
            users[0].login.should.be.equal('phil');
            users[1].login.should.be.equal('michl');
            
            next();
          });          
        });
      });      
    });
    
    describe('offset()', function(){
      it('finds the last 2 users', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.offset(1).exec(function(users){
            users.length.should.be.equal(2);
            
            users[0].login.should.be.equal('michl');
            users[1].login.should.be.equal('admin');
            
            next();
          });          
        });
      });      
    });
  
  
    describe('where()', function(){
    
      it('where with like returns the right sql', function(next){ 
        store.ready(function(){
          var User = store.Model('User');
          User.where({login_like: 'phi'}).toSql().should.be.equal('select * from "users" where "users"."login" like \'%phi%\'');
          next();
        });
      });
    
    
      it('finds phil with like', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({login_like: 'ph'}).exec(function(result){
            result.length.should.be.equal(1);
            result[0].login.should.be.equal('phil');
            next();
          });
        });      
      });
    
      it('finds phil with like (without exec)', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({login_like: 'ph'}, function(result){
            result.length.should.be.equal(1);
            result[0].login.should.be.equal('phil');
            next();
          });
        });      
      }); 
    
    
    
      it('finds phil with array condition', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where(['login = ?', 'phil']).exec(function(result){
            result.length.should.be.equal(1);
            result[0].login.should.be.equal('phil');
            next();
          });
        });      
      });
      
      
      it('finds phil with array condition (IN (name))', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where(['login IN (?)', ['phil']]).exec(function(result){
            result.length.should.be.equal(1);
            result[0].login.should.be.equal('phil');
            next();
          });
        });      
      });
      
      it('finds phil and michl with array condition (IN (ids))', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where(['id IN (?)', [1, 2]]).exec(function(result){
            result.length.should.be.equal(2);
            result[0].login.should.be.equal('phil');
            result[1].login.should.be.equal('michl');
            next();
          });
        });      
      });
      
      it('finds phil and michl with array condition (IN (ids) login = ?)', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where(['login = ? OR id IN (?)', 'phil', [1, 2]]).exec(function(result){
            result.length.should.be.equal(2);
            result[0].login.should.be.equal('phil');
            result[1].login.should.be.equal('michl');
            next();
          });
        });      
      });
      
      it('finds phil and michl with array condition (IN (names))', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where(['login IN (?)', ['phil', 'michl']]).exec(function(result){
            result.length.should.be.equal(2);
            result[0].login.should.be.equal('phil');
            result[1].login.should.be.equal('michl');
            next();
          });
        });      
      });
    
    
      it('finds NOT michl and admin', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({login_not: ['michl', 'admin']}).exec(function(result){
            result.length.should.be.equal(1);
            result[0].login.should.be.equal('phil');
            next();
          });
        });      
      });
    
    
      it('finds michl and admin with like', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({login_like: ['mich', 'adm']}).order('login').exec(function(result){
            result.length.should.be.equal(2);
            result[0].login.should.be.equal('admin');
            result[1].login.should.be.equal('michl');
            next();
          });
        });      
      });
    
    
      it('finds nothing with empty array in condition (IS NULL)', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({login: []}).exec(function(result){
            result.length.should.be.equal(0);
            next();
          });
        });      
      });
      
      
      it('finds nothing with IS NULL condition', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({login: null}).exec(function(result){
            result.length.should.be.equal(0);
            next();
          });
        });      
      });
      
      
      it('finds all with IS NOT NULL condition', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({login_not: null}).exec(function(result){
            result.length.should.be.greaterThan(0);
            next();
          });
        });      
      });
      
      it('finds all where created_at is greater than 2014-01-05', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({created_at_gt: '2014-01-05'}).exec(function(result){
            result.length.should.be.equal(1);
            next();
          });
        });      
      });
      
      it('finds all where created_at is greater than equal 2014-01-05', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({created_at_gte: '2014-01-05'}).exec(function(result){
            result.length.should.be.equal(2);
            next();
          });
        });      
      });
      
      it('finds all where created_at is lower than 2014-01-05', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({created_at_lt: '2014-01-05'}).exec(function(result){
            result.length.should.be.equal(1);
            next();
          });
        });      
      });
      
      it('finds all where created_at is lower than equal 2014-01-05', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({created_at_lte: '2014-01-05'}).exec(function(result){
            result.length.should.be.equal(2);
            next();
          });
        });      
      });
           
      
      it('finds all where created_at is between 2014-01-05 and 2014-01-20', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({created_at_between: ['2014-01-05', '2014-01-20']}).exec(function(result){
            result.length.should.be.equal(2);
            next();
          });
        });      
      });
      
      it('finds all where created_at is between (2014-01-09 and 2014-01-20) and (2014-01-01 and 2014-01-04)', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({created_at_between: [['2014-01-09', '2014-01-20'], ['2014-01-01', '2014-01-04']]}).exec(function(result){
            result.length.should.be.equal(2);
            next();
          });
        });      
      });
      
      
      it('finds all where email attribute equal private_email attribute', function(next){
        store.ready(function(){
          var User = store.Model('User');
          User.where({email: {attribute: 'private_email'}}).exec(function(result){
            result.length.should.be.equal(1);
            next();
          });
        });      
      });
       
    });
  
  
  });
    
}  