var should = require('should');

var Store = require('../../lib/store');

describe('Inspect', function(){
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
  
  describe('inspect()', function(){
    
    it('method exists', function(){
      phil.inspect.should.be.a.Function;
    })
    
    it('returns a string representing a record', function(){
      var str = phil.inspect();
      str.should.be.a.String;
      str.should.be.equal('<User {login:"phil"}>')
    });
    
    it('returns a string representing a record with relations', function(){
      var str = michl.inspect();
      str.should.be.equal([
        '<User {login:"michl",',
        '  posts: [',
        '    <Post {title:"foo"}>,',
        '    <Post {title:"bar"}>',
        '  ]', 
        '}>'].join("\n"))
    });
    
    it('returns a string representing a collection', function(){
      var str = michl.posts.inspect();
      str.should.be.equal([
        '[',
        '  <Post {title:"foo"}>,',
        '  <Post {title:"bar"}>',
        ']'].join("\n"))
    });
    
    it('returns a string representing a model', function(){
      var str = User.inspect();
      str.should.be.equal('<User [login]>')
    });
      
  });

});