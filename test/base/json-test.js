var should = require('should');

var Store = require('../../lib/store');

describe('JSON', function(){
  var store = new Store();

  store.Model('User', function(){
    this.attribute('login');
    this.attribute('a');
    this.attribute('b');
    this.attribute('c');
    this.hasMany('posts')
  });

  store.Model('Post', function(){
    this.attribute('title');
    this.belongsTo('user');
  });


  var User, Collection, posts, michl, phil;

  before(function(next){
    store.ready(function(){

      User = store.Model('User');

      posts = [{title:'foo'}, {title: 'bar'}];

      phil = User.new({login: 'phil', foo: 'bar', a:'A', b:'B', c:'C'});
      michl = User.new({login: 'michl', foo: 'bar', a:'A1', b:'B1', c:'C1', posts:posts});

      Collection = User.chain().add(phil).add(michl);

      next();
    })
  })

  describe('Record toJson()', function(){

    it('method exists', function(){
      phil.toJson.should.be.a.Function;
    })

    it('returns a new object', function(){
      var json = phil.toJson();
      json.should.not.be.eql(phil);
      json.login.should.be.equal('phil');
      should.not.exist(json.foo);
      json.should.be.eql({login:'phil', a:'A', b:'B', c:'C'});
    });

    it('returns only specified fields', function(){
      var json = phil.toJson(['a', 'c', 'posts']);
      json.should.be.eql({a:'A', c:'C'});
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

    it('returns only specified fields', function(){
      var json = Collection.toJson(['a', 'c', 'posts']);
      json.should.be.eql([{a:'A', c:'C'}, {a:'A1', c:'C1', posts:[{title:'foo'}, {title:'bar'}]}]);
    });

    it('returns a new object with relations', function(){
      var json = Collection.toJson();
      json[1].login.should.be.equal('michl');
      json[1].posts.should.be.eql(posts);
      michl.posts.should.not.be.eql(json[1].posts);
    });

  });

});
