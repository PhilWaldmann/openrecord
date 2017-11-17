var Store = require('../../store/base')

describe('Inspect', function(){
  var store = new Store()

  store.Model('User', function(){
    this.attribute('login')
    this.hasMany('posts')
  })

  store.Model('Post', function(){
    this.attribute('title')
    this.belongsTo('user')
  })

  var User, posts, michl, phil

  before(function(next){
    store.ready(function(){
      User = store.Model('User')

      posts = [{title: 'foo'}, {title: 'bar'}]

      phil = User.new({login: 'phil', foo: 'bar'})
      michl = User.new({login: 'michl', foo: 'bar', posts: posts})

      User.chain().add(phil).add(michl)

      next()
    })
  })

  describe('inspect()', function(){
    it('method exists', function(){
      phil.inspect.should.be.a.Function()
    })

    it('returns a string representing a record', function(){
      var str = phil.inspect()
      str.should.be.a.String()
      str.should.be.equal('<User {login:"phil"}>')
    })

    it('returns a string representing a record with relations', function(){
      var str = michl.inspect()
      str.should.be.equal([
        '<User {login:"michl",',
        '  posts: [',
        '    <Post {title:"foo"}>,',
        '    <Post {title:"bar"}>',
        '  ]',
        '}>'].join('\n'))
    })

    it('returns a string representing a collection', function(){
      var str = michl.posts.inspect()
      str.should.be.equal([
        '[',
        '  <Post {title:"foo"}>,',
        '  <Post {title:"bar"}>',
        ']'].join('\n'))
    })

    it('returns a string representing a model', function(){
      var str = User.inspect()
      str.should.be.equal('<User [login]>')
    })
  })
})
