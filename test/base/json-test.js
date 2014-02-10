var should = require('should');

var Store = require('../../lib/store');

describe('JSON', function(){
  var store = new Store();

  store.Model('User', function(){
    this.attribute('login');
    this.hasMany('posts')
  });
  
  store.Model('Post', function(){
    this.attribute('title');
    this.belongsTo('user');
  });
  
  var User = store.Model('User');
  
  var posts = [{title:'foo'}, {title: 'bar'}];
  
  var phil = User.new({login: 'phil', foo: 'bar'});
  var michl = User.new({login: 'michl', foo: 'bar', posts:posts});
  
  Collection = User.chain().add(phil).add(michl);
  
  describe('Record toJson()', function(){
    
    it('method exists', function(){
      phil.toJson.should.be.a.Function;
    })
    
    it('returns a new object', function(){
      var json = phil.toJson();
      json.should.not.be.eql(phil);
      json.login.should.be.equal('phil');
      should.not.exist(json.foo);
      json.posts.should.be.eql([]);
    });
    
    it('returns a new object with relations', function(){
      var json = michl.toJson();
      json.should.not.be.eql(michl);
      json.login.should.be.equal('michl');
      should.not.exist(json.foo);
      json.posts.should.be.eql(posts);
      michl.posts.should.not.be.eql(json.posts);
    });
      
  });
  
  
  describe('Collection toJson()', function(){
    
    it('method exists', function(){
      Collection.toJson.should.be.a.Function;
    })
    
    it('returns a new object', function(){
      var json = Collection.toJson();
      json.should.not.be.eql(Collection);
      json.should.be.instanceof(Array);
      json[0].login.should.be.equal('phil');
    });
    
    it('returns a new object with relations', function(){
      var json = Collection.toJson();
      json[1].login.should.be.equal('michl');
      json[1].posts.should.be.eql(posts);
      michl.posts.should.not.be.eql(json[1].posts);
    });
      
  });
  
});