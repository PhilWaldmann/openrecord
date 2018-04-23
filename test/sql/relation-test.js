var should = require('should')

var Store = require('../../store/sql')

describe('SQL: Relations', function() {
  var store, store2

  before(function() {
    store = new Store({
      type: 'sql',
      name: 'MyStore'
    })

    store2 = new Store({
      type: 'sql',
      name: 'MyStore2'
    })

    store.Model('User', function() {
      this.attribute('id', Number, { primary: true })
      this.hasMany('posts')
      this.hasMany('bar', { model: 'Foo' })
      this.belongsTo('user', { store: 'MyStore2' })
    })
    store.Model('Post', function() {
      this.attribute('id', Number, { primary: true })
      this.attribute('user_id', Number)
      this.attribute('foo_id', Number)
      this.attribute('bazinga_id', Number)
      this.belongsTo('user')
      this.belongsTo('bar', { model: 'Foo' })
      this.belongsTo('bazinga', { model: 'Baz' })
    })

    store.Model('Foo', function() {
      this.attribute('id', Number, { primary: true })
      this.attribute('user_id', Number)
    })

    store.Model('Baz', function() {
      this.attribute('id', Number, { primary: true })
    })

    store2.Model('User', function() {
      this.attribute('id', Number, { primary: true })
      this.attribute('user_id', Number)

      this.belongsTo('user', { store: 'MyStore' })
    })
  })

  it('hasMany() has the right foreign key', function() {
    return store.ready(function() {
      var User = store.Model('User')
      User.definition.relations.posts.init()
      User.definition.relations.posts.to.should.be.eql(['user_id'])
    })
  })

  it('hasMany() has the right primary key', function() {
    return store.ready(function() {
      var User = store.Model('User')
      User.definition.relations.posts.from.should.be.eql(['id'])
    })
  })

  it('hasMany() with custom model has the right foreign key', function() {
    return store.ready(function() {
      var User = store.Model('User')
      User.definition.relations.bar.init()
      User.definition.relations.bar.to.should.be.eql(['user_id'])
    })
  })

  it('hasMany() with custom model has the right primary key', function() {
    return store.ready(function() {
      var User = store.Model('User')
      User.definition.relations.bar.init()
      User.definition.relations.bar.from.should.be.eql(['id'])
    })
  })

  it('belongsTo() has the right foreign key', function() {
    return store.ready(function() {
      var Post = store.Model('Post')
      Post.definition.relations.user.init()
      Post.definition.relations.user.to.should.be.eql(['id'])
    })
  })

  it('belongsTo() has the right primary key', function() {
    return store.ready(function() {
      var Post = store.Model('Post')
      Post.definition.relations.user.init()
      Post.definition.relations.user.from.should.be.eql(['user_id'])
    })
  })

  it('belongsTo() with custom model has the right foreign key', function() {
    return store.ready(function() {
      var Post = store.Model('Post')
      Post.definition.relations.bar.init()
      Post.definition.relations.bar.to.should.be.eql(['id'])
    })
  })

  it('belongsTo() with custom model has the right primary key', function() {
    return store.ready(function() {
      var Post = store.Model('Post')
      Post.definition.relations.bar.init()
      Post.definition.relations.bar.from.should.be.eql(['foo_id'])
    })
  })

  it('belongsTo() with custom model and same field name has the right foreign key', function() {
    return store.ready(function() {
      var Post = store.Model('Post')
      Post.definition.relations.bazinga.init()
      Post.definition.relations.bazinga.to.should.be.eql(['id'])
    })
  })

  it('belongsTo() with custom model and same field name has the right primary key', function() {
    return store.ready(function() {
      var Post = store.Model('Post')
      Post.definition.relations.bazinga.init()
      Post.definition.relations.bazinga.from.should.be.eql(['bazinga_id'])
    })
  })

  it('belongsTo() with cross store relation', function() {
    return Promise.all([store.ready(), store2.ready()]).then(function() {
      var User = store.Model('User')
      var User2 = store2.Model('User')

      User2.definition.relations.user.init()
      const equal = User2.definition.relations.user.model === User

      equal.should.be.equal(true)
    })
  })

  it('belongsTo() with cross store relation from the other side', function() {
    return Promise.all([store.ready(), store2.ready()]).then(function() {
      var User = store.Model('User')
      var User2 = store2.Model('User')
      User.definition.relations.user.init()
      const equal = User.definition.relations.user.model === User2

      equal.should.be.equal(true)
    })
  })

  it('should not create a relation if the store is not available', function() {
    var tmp = new Store({
      type: 'sql'
    })

    tmp.Model('Foo', function() {
      this.belongsTo('bar', { store: 'UNKNOWN' })
    })

    return tmp
      .ready(function() {
        var Foo = tmp.Model('Foo')
        Foo.definition.relations.bar.init()
      })
      .should.be.rejectedWith(Error, {
        message: "Unknown store 'UNKNOWN' on relation 'bar'"
      })
  })

  it('should wait until the requested store is available', function() {
    var tmp = new Store({
      type: 'sql'
    })

    tmp.Model('Foo', function() {
      this.belongsTo('bar', { store: 'OTHER' })
    })

    var tmp2 = new Store({
      type: 'sql',
      name: 'OTHER'
    })

    tmp2.Model('Bar', function() {})

    return tmp.ready(function() {
      var Foo = tmp.Model('Foo')
      process.nextTick(function() {
        should.exists(Foo.definition.relations.bar)
      })
    })
  })
})
