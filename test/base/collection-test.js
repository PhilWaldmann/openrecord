var should = require('should');

var Store = require('../../lib/store');

describe('Collection', function(){
  var store = new Store();

  store.Model('User', function(){
    this.attribute('login');
  });
  
  var User = store.Model('User');
  var Chain = User.chain();
  
  
  it('chained model has add()', function(){
    should.exist(Chain.add);
  });
  
  it('chained model has remove()', function(){
    should.exist(Chain.remove);
  });
  
  
  describe('add()', function(){
    Chain.add({login:'phil', unknown_attr:'test'});
    Chain.add({login:'admin'});
    Chain.add({login:'michl'});
  
    it('record has been added', function(){
      Chain.length.should.be.equal(3);
      Chain[0].should.have.property('login');
      should.not.exist(Chain[0].unknown_attr);
      Chain[0].should.be.an.instanceof(User);
    });
  
    it('new chained model does not have records', function(){
      User.chain().length.should.be.equal(0);
    });
    
  });
  
  
  
  describe('remove()', function(){    

    var Chain = User.chain();
    Chain.add({login:'phil'});
    Chain.add({login:'admin'});
    Chain.add({login:'michl'});
        
    it('works by passing in a number', function(){
      Chain.remove(1);
      Chain.length.should.be.equal(2);
    });
    
    it('index is corrext', function(){
      Chain[1].login.should.be.equal('michl');
    });
    
  });
  
  
  
  describe('new()', function(){    

    var Chain = User.chain();
    Chain.add({login:'phil'});
    Chain.new();
        
    it('adds a new record', function(){
      Chain.length.should.be.equal(2);
    });
    
  });
  
  
  
  describe('.every', function(){    

    var Chain = User.chain();
    Chain.add({login:'phil'});
    Chain.add({login:'admin'});
    Chain.add({login:'michl'});
       
    
    it('every.login', function(){
      Chain.every.login.should.be.eql(['phil', 'admin', 'michl']);
    });
    
    it('every.login=', function(){
      Chain.every.login = 'matt';
      Chain.every.login.should.be.eql(['matt', 'matt', 'matt']);
    }); 
    
        
    it('every.set()', function(){
      Chain.every.set('login', 'max');
      Chain[0].login.should.be.equal('max');
      Chain[1].login.should.be.equal('max');
      Chain[2].login.should.be.equal('max');
    });
    
    /* //do we really want to get callbacks called multiple times?
    it('all.isValid()', function(done){
      Chain.all.isValid(function(valid){
        console.log('VALID', valid);
        done();
      });
    });
    */  
  });
  
  
});