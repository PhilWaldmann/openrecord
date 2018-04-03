var should = require('should')

var Store = require('../../store/base')

describe('Relations', function(){
  describe('hasMany()', function(){
    var store = new Store()

    store.Model('User', function(){
      this.attribute('id', Number, {primary: true})
      this.attribute('login', String)
      this.hasMany('posts')
    })

    store.Model('Post', function(){
      this.attribute('id', Number, {primary: true})
      this.attribute('user_id', Number)
      this.attribute('title', String)
    })

    var User, Post, phil

    before(function(){
      return store.ready(function(){
        User = store.Model('User')
        Post = store.Model('Post')
        phil = new User({id: 10, login: 'phil',
          posts: [
            { title: 'Title A' },
            { title: 'Title B', invalid_attribute: 'test' }
          ]
        })
      })
    })


    it('posts exist', function(){
      should.exist(phil.posts)
    })

    it('posts is a Collection and a Promise', function(){      
      phil.posts.should.be.an.instanceof(Array)
      return phil.posts.then(function(posts){
        posts.should.be.an.instanceof(Array)
      })
    })

    it('posts has Model methods', function(){
      phil.posts.new.should.be.a.Function()
      phil.posts.chain.should.be.a.Function()
    })

    it('posts should be a chained Model', function(){
      phil.posts.should.not.be.equal(Post)
      phil.posts.should.be.equal(phil.posts.chain())
    })


    it('posts is an array of Post Records', function(){
      phil.posts[0].should.have.property('title')
      phil.posts[1].title.should.be.equal('Title B')
      should.not.exist(phil.posts[1].invalid_attribute)
    })

    it('adding a new post will automatically add the user_id', function(){
      phil.posts.add({title: 'new'})

      phil.posts[2].title.should.be.equal('new')
      phil.posts[2].user_id.should.be.equal(10)
    })
  })






  describe('belongsTo()', function(){
    var store = new Store()

    store.Model('User', function(){
      this.hasMany('websites')
      this.attribute('guid', Number, {primary: true})
      this.attribute('login', String)
    })

    store.Model('Website', function(){
      this.attribute('id', Number, {primary: true})
      this.attribute('url', String)
      this.attribute('user_guid', Number)
    })

    store.Model('Post', function(){
      this.attribute('id', Number, {primary: true})
      this.attribute('user_guid', Number)
      this.attribute('title', String)
      this.belongsTo('user')
    })

    var User, Post, post, nestedPost

    before(function(){
      return store.ready(function(){
        User = store.Model('User')
        Post = store.Model('Post')
        post = new Post({
          title: 'title A',
          user: {login: 'phil'}
        })

        nestedPost = new Post({
          title: 'title A',
          user: {
            login: 'phil',
            websites: [{
              url: 'http://www.digitalbits.at'
            }, {
              url: 'http://github.com'
            }]
          }
        })
      })
    })


    it('user exist', function(){
      should.exist(post.user)
    })

    it('user is a Record', function(){
      return post.user.then(function(user){
        user.should.be.an.instanceof(User)
      })
    })

    it('user has Record methods (via promise)', function(){     
      return post.user.then(function(user){
        user.isValid.should.be.a.Function()
        user.validate.should.be.a.Function()
      })
    })


    it('user has Record methods (via promise free access)', function(){      
      post._user.isValid.should.be.a.Function()
      post._user.validate.should.be.a.Function()
    })


    it('user has the right attributes', function(){
      post._user.should.have.property('login')
      post._user.login.should.be.equal('phil')
    })


    it('assignment of a hash creates a new model', function(){
      post.user = {login: 'admin', unknown_attr: 'test', guid: 99}

      post._user.login.should.be.equal('admin')
      should.not.exist(post._user.unknown_attr)
    })


    it('the user_id was automatically set', function(){      
      post.user_guid.should.be.equal(99)
    })


    it('assignment of null removes the related record', function(){
      post.user = null

      should.not.exist(post._user)

      return post.user.then(function(user){
        should.not.exist(user)
      })
    })


    it('assignment of a record works', function(){
      var user = new User({login: 'admin'})

      post.user = user

      post._user.login.should.be.equal('admin')
      post._user.should.be.equal(user)
    })

    it('assignment of nested records works', function(){
      nestedPost._user.login.should.be.equal('phil')
      nestedPost._user.websites.length.should.be.equal(2)
    })
  })



  describe('belongsToMany()', function(){
    var store = new Store()

    store.Model('User', function(){
      this.attribute('id', Number, {primary: true})
      this.attribute('post_guids', Array)
      this.attribute('login', String)
      this.belongsToMany('posts')
    })

    store.Model('Post', function(){
      this.attribute('guid', Number, {primary: true})
      this.attribute('title', String)
    })


    var User, Post, phil
    before(function(){
      return store.ready(function(){
        User = store.Model('User')
        Post = store.Model('Post')
        phil = new User({
          login: 'phil',
          posts: [
            { guid: 2, title: 'Title A' },
            { guid: 3, title: 'Title B', invalid_attribute: 'test' }
          ]}
        )
      })
    })


    it('posts exist', function(){
      should.exist(phil.posts)
    })

    it('posts is an Array', function(){
      phil.posts.should.be.an.instanceof(Array)
    })

    it('posts has Model methods', function(){
      phil.posts.new.should.be.a.Function()
      phil.posts.chain.should.be.a.Function()
    })

    it('posts should be a chained Model', function(){
      phil.posts.should.not.be.equal(Post)
      phil.posts.should.be.equal(phil.posts.chain())
    })


    it('posts is an array of Post Records', function(){
      phil.posts[0].should.have.property('title')
      phil.posts[1].title.should.be.equal('Title B')
      should.not.exist(phil.posts[1].invalid_attribute)
    })


    it('adding a new record will add the corresponding id to the parent', function(){
      phil.posts.add({guid: 4, title: 'new'})      
      phil.post_guids.should.be.eql([2, 3, 4])
    })
  })




  describe('async loading', function(){
    var store = new Store()

    store.Model('User', function(){
      this.hasMany('posts')
      return new Promise(function(resolve){
        setTimeout(resolve, 10)
      })
    })

    store.Model('Post', function(){
      this.belongsTo('user')
      return new Promise(function(resolve){
        setTimeout(resolve, 20)
      })
    })


    it('all relations are loaded', function(){
      return store.ready(function(){
        var User = store.Model('User')
        var Post = store.Model('Post')

        User.definition.relations.should.have.property('posts')
        Post.definition.relations.should.have.property('user')
      })
    })
  })
})
