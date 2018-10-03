var should = require('should')
var path = require('path')
var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Migrations Fresh', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      storeConf.migrations = path.join(
        __dirname,
        '..',
        '..',
        'fixtures',
        'migrations',
        '*'
      )
      storeConf.plugins = require('../../../lib/base/dynamic_loading')

      store = new Store(storeConf)

      store.Model('User', function() {})
      store.Model('Post', function() {})
      store.Model('Test', function() {})
      store.Model('AttributeTest', function() {})
      store.Model('CompoundPrimaryKey', function() {})
      store.Model('WithComment', function() {})
      store.Model('WithReference', function() {})
      store.Model('WithIndex', function() {})
    })

    it('are finished before ready() gets called', function() {
      return store.ready(function() {
        var User = store.Model('User')
        should.exist(User)
      })
    })

    it('has all attributes loaded', function() {
      return store.ready(function() {
        var User = store.Model('User')
        User.definition.attributes.should.have.property('id')
        User.definition.attributes.should.have.property('login')
        User.definition.attributes.should.have.property('first_name')
        User.definition.attributes.should.have.property('last_name')
      })
    })

    it('has a primary key', function() {
      return store.ready(function() {
        var User = store.Model('User')
        User.definition.primaryKeys.length.should.be.equal(1)
        User.definition.primaryKeys.should.be.eql(['id'])
      })
    })

    it('has not_null definition', function() {
      return store.ready(function() {
        var User = store.Model('User')

        User.definition.attributes.id.notnull.should.be.equal(true)
        User.definition.attributes.login.notnull.should.be.equal(true)
        User.definition.attributes.first_name.notnull.should.be.equal(false)
      })
    })

    it('second migrations was executed as well', function() {
      return store.ready(function() {
        var Post = store.Model('Post')

        Post.definition.attributes.should.have.property('id')
        Post.definition.attributes.should.have.property('message')
      })
    })

    it('has the right data type', function() {
      return store.ready(function() {
        var AttributeTest = store.Model('AttributeTest')

        AttributeTest.definition.attributes.string_attr.type.name.should.be.equal(
          'string'
        )
        AttributeTest.definition.attributes.text_attr.type.name.should.be.equal(
          'string'
        )
        AttributeTest.definition.attributes.integer_attr.type.name.should.be.equal(
          'integer'
        )
        AttributeTest.definition.attributes.float_attr.type.name.should.be.equal(
          'float'
        )
        AttributeTest.definition.attributes.boolean_attr.type.name.should.be.equal(
          'boolean'
        )
        AttributeTest.definition.attributes.date_attr.type.name.should.be.equal(
          'date'
        )
        AttributeTest.definition.attributes.datetime_attr.type.name.should.be.equal(
          'datetime'
        )

        if (store.type === 'postgres' || store.type === 'mysql') {
          AttributeTest.definition.attributes.binary_attr.type.name.should.be.equal(
            'binary'
          )
          AttributeTest.definition.attributes.time_attr.type.name.should.be.equal(
            'time'
          )
        } else {
          AttributeTest.definition.attributes.binary_attr.type.name.should.be.equal(
            'string'
          ) // TODO: SHOULD BE binary
          AttributeTest.definition.attributes.time_attr.type.name.should.be.equal(
            'string'
          ) // TODO: SHOULD BE time
        }
      })
    })

    it('has all stampable() attributes', function() {
      return store.ready(function() {
        var Post = store.Model('Post')
        Post.definition.attributes.should.have.property('updated_at')
        Post.definition.attributes.should.have.property('created_at')
        Post.definition.attributes.should.have.property('updater_id')
        Post.definition.attributes.should.have.property('creator_id')
      })
    })

    it('has all polymorph() attributes', function() {
      return store.ready(function() {
        var Post = store.Model('Post')
        Post.definition.attributes.should.have.property('foo_id')
        Post.definition.attributes.should.have.property('foo_type')
      })
    })

    it('has all nestedSet() attributes', function() {
      return store.ready(function() {
        var Post = store.Model('Post')
        Post.definition.attributes.should.have.property('lft')
        Post.definition.attributes.should.have.property('rgt')
        Post.definition.attributes.should.have.property('depth')
        Post.definition.attributes.should.have.property('parent_id')
      })
    })

    it('has all paranoid() attributes', function() {
      return store.ready(function() {
        var Post = store.Model('Post')
        Post.definition.attributes.should.have.property('deleted_at')
        Post.definition.attributes.should.have.property('deleter_id')
      })
    })

    it('has created a view', function() {
      return store.ready(function() {
        var Test = store.Model('Test')
        return Test.find(1).exec(function(user) {
          user.login.should.be.equal('phil')
        })
      })
    })

    it('has seeded some records', function() {
      return store.ready(function() {
        var User = store.Model('User')

        return User.find(1).exec(function(user) {
          user.login.should.be.equal('phil')
        })
      })
    })

    it('has default text value', function() {
      return store.ready(function() {
        var AttributeTest = store.Model('AttributeTest')

        return AttributeTest.create().then(function() {
          return AttributeTest.find(this.id).exec(function(record) {
            record.with_default_text.should.be.equal('foo')
          })
        })
      })
    })

    it('has default integer value', function() {
      return store.ready(function() {
        var AttributeTest = store.Model('AttributeTest')

        return AttributeTest.create().then(function() {
          return AttributeTest.find(this.id).exec(function(record) {
            record.with_default_integer.should.be.equal(55)
          })
        })
      })
    })

    it('has default boolean value', function() {
      return store.ready(function() {
        var AttributeTest = store.Model('AttributeTest')

        return AttributeTest.create().then(function() {
          return AttributeTest.find(this.id).exec(function(record) {
            record.with_default_boolean.should.be.equal(true)
          })
        })
      })
    })


    it('has compound primary keys', function() {
      return store.ready(function() {
        var CompoundPrimaryKey = store.Model('CompoundPrimaryKey')

        CompoundPrimaryKey.definition.attributes.foo.primary.should.be.equal(true)
        CompoundPrimaryKey.definition.attributes.bar.primary.should.be.equal(true)
        CompoundPrimaryKey.definition.primaryKeys.should.be.eql(['foo', 'bar'])
      })
    })

    it('has column comments', function() {
      return store.ready(function() {
        var WithComment = store.Model('WithComment')
        if(store.type === 'mysql' || store.type === 'postgres') {
          WithComment.definition.attributes.foo.description.should.be.equal('foobar')
        }
      })
    })

    it('reference is in place', function() {
      return store.ready(function() {
        var WithReference = store.Model('WithReference')
        // no post with id 9999 in the db!
        return WithReference.create({post_id: 9999})
      })
      .should.be.rejectedWith(store.SQLError)
    })


    it('uniqe index workds', function() {
      return store.ready(function() {
        var WithIndex = store.Model('WithIndex')
        // no duplicate keys
        return WithIndex.create([{foo: 1}, {foo: 1}])
      })
      .should.be.rejectedWith(Error)
    })
  })
}
