var Store = require('../../store/sql')

describe('SQL: Helper', function() {
  var store

  before(function() {
    store = new Store({
      type: 'sql'
    })

    // a store of type sql does not have any data types
    // so just create some dummy types
    // store.addOperator('eq', function(){}, {default: true})
    // store.addOperator('like', function(){})

    store.addType(
      'string',
      function(value) {
        return value
      },
      { operators: { defaults: ['eq', 'like'] } }
    )

    store.addType(
      'integer',
      function(value) {
        return value
      },
      { operators: { defaults: ['eq', 'like'] } }
    )

    store.Model('User', function() {
      this.attribute('my_id', 'integer', { primary: true })
      this.attribute('login', 'string')
      this.hasMany('posts')
      this.hasMany('threads')
      this.hasMany('unread_posts')
      this.hasMany('unread', { through: 'unread_posts' })
      this.hasMany('unread_threads', { through: 'unread', relation: 'thread' })
      this.hasMany('poly_things')
      this.hasMany('members', { through: 'poly_things', relation: 'member' })
    })

    store.Model('Thread', function() {
      this.attribute('id', 'integer', { primary: true })
      this.attribute('title', 'string')
      this.belongsTo('user')
      this.hasMany('posts')
    })

    store.Model('Post', function() {
      this.attribute('aid', 'integer', { primary: true })
      this.belongsTo('user')
      this.belongsTo('thread')
    })

    store.Model('UnreadPost', function() {
      this.attribute('id', 'integer', { primary: true })
      this.belongsTo('user')
      this.belongsTo('unread', { model: 'Post' })
    })

    store.Model('PolyThing', function() {
      this.attribute('id', 'integer', { primary: true })
      this.belongsToPolymorphic('member')
    })
  })

  describe('toIncludesList()', function() {
    it('works with a single relation', function() {
      return store.ready(function() {
        var result = store.utils.toIncludesList('posts')
        result.length.should.be.equal(1)
        result.should.be.eql([
          {
            relation: 'posts',
            children: [],
            args: [],
            scope: null,
            conditions: null,
            through: false
          }
        ])
      })
    })

    it('works with a single relation as an array', function() {
      return store.ready(function() {
        var result = store.utils.toIncludesList(['posts'])
        result.length.should.be.equal(1)
        result.should.be.eql([
          {
            relation: 'posts',
            children: [],
            args: [],
            scope: null,
            conditions: null,
            through: false
          }
        ])
      })
    })

    it('works with a multiple relations', function() {
      return store.ready(function() {
        var result = store.utils.toIncludesList(['posts', 'threads'])
        result.length.should.be.equal(2)
        result[0].relation.should.be.eql('posts')
        result[1].relation.should.be.eql('threads')
      })
    })

    it('works with nested relations', function() {
      return store.ready(function() {
        var result = store.utils.toIncludesList({ posts: 'thread' })
        result.length.should.be.equal(1)
        result[0].relation.should.be.eql('posts')
        result[0].children.should.be.eql('thread')
      })
    })

    it('works with nested relations as an array', function() {
      return store.ready(function() {
        var result = store.utils.toIncludesList(['posts', { threads: 'posts' }])
        result.length.should.be.equal(2)
        result[0].relation.should.be.eql('posts')
        result[1].relation.should.be.eql('threads')
        result[1].children.should.be.eql('posts')
      })
    })

    it('works with deeply nested relations', function() {
      return store.ready(function() {
        var result = store.utils.toIncludesList([
          'posts',
          { threads: { posts: 'user' } }
        ])
        result.length.should.be.equal(2)
        result[0].relation.should.be.eql('posts')
        result[1].relation.should.be.eql('threads')
        result[1].children.should.be.eql({ posts: 'user' })
      })
    })

    it('works with through relations', function() {
      return store.ready(function() {
        const User = store.Model('User')
        const chain = User.include('unread')
        var result = chain.getInternal('includes')

        result.length.should.be.equal(1)
        result[0].relation.should.be.eql('unread')
        result[0].through.should.be.equal(true)
      })
    })

    it('works with nested relations and through', function() {
      return store.ready(function() {
        var result = store.utils.toIncludesList({ threads: { user: 'unread' } })
        result.length.should.be.equal(1)
        result[0].relation.should.be.eql('threads')
        result[0].children.should.be.eql({ user: 'unread' })
      })
    })

    it('works with arguments', function() {
      return store.ready(function() {
        var result = store.utils.toIncludesList({ members: { $args: 'foo' } })
        result.length.should.be.equal(1)
        result[0].relation.should.be.eql('members')
        result[0].args.should.be.eql(['foo'])
      })
    })
  })

  describe('toJoinsList', function() {
    it('works with a single relation', function() {
      return store.ready(function() {
        var result = store.utils.toJoinsList('posts')
        result.length.should.be.equal(1)
        result.should.be.eql([
          {
            relation: 'posts',
            children: [],
            args: [],
            scope: null,
            conditions: null,
            through: false
          }
        ])
      })
    })

    it('works with a single relation as an array', function() {
      return store.ready(function() {
        var result = store.utils.toJoinsList(['posts'])
        result.length.should.be.equal(1)
        result.should.be.eql([
          {
            relation: 'posts',
            children: [],
            args: [],
            scope: null,
            conditions: null,
            through: false
          }
        ])
      })
    })

    it('works raw joins', function() {
      return store.ready(function() {
        var result = store.utils.toJoinsList(['JOIN foo on foo.bar = bar.foo'])
        result.length.should.be.equal(1)
        result.should.be.eql([
          {
            type: 'raw',
            query: 'JOIN foo on foo.bar = bar.foo',
            args: []
          }
        ])
      })
    })
  })

  describe('toConditionList()', function() {
    it('works with a simple hash conditions', function() {
      return store.ready(function() {
        var User = store.Model('User')
        var result = store.utils.toConditionList(
          { login: 'phil' },
          Object.keys(User.definition.attributes)
        )

        result.should.be.eql([
          {
            type: 'hash',
            attribute: 'login',
            operator: null,
            value: 'phil'
          }
        ])
      })
    })

    it('works with basic operators', function() {
      return store.ready(function() {
        var User = store.Model('User')
        var result = store.utils.toConditionList(
          { login_like: 'phil' },
          Object.keys(User.definition.attributes)
        )

        result.should.be.eql([
          {
            type: 'hash',
            attribute: 'login',
            operator: 'like',
            value: 'phil'
          }
        ])
      })
    })

    it('works with operators and snake case attribute names', function() {
      return store.ready(function() {
        var result = store.utils.toConditionList(
          { text_romanized_like: 'text' },
          ['text_romanized']
        )

        result.should.be.eql([
          {
            type: 'hash',
            attribute: 'text_romanized',
            operator: 'like',
            value: 'text'
          }
        ])
      })
    })

    it('works with snake case attribute names which include operator name', function() {
      return store.ready(function() {
        var result = store.utils.toConditionList(
          { text_romanized_like: 'text' },
          ['text_romanized_like']
        )

        result.should.be.eql([
          {
            type: 'hash',
            attribute: 'text_romanized_like',
            operator: null,
            value: 'text'
          }
        ])
      })
    })

    it('works with multiple snake case attribute names which include operator name', function() {
      return store.ready(function() {
        var result = store.utils.toConditionList(
          { text_romanized_like: 'text' },
          ['text_romanized_like', 'text']
        )

        result.should.be.eql([
          {
            type: 'hash',
            attribute: 'text_romanized_like',
            operator: null,
            value: 'text'
          }
        ])
      })
    })

    it('works with multiple reversed snake case attribute names which include operator name', function() {
      return store.ready(function() {
        var result = store.utils.toConditionList(
          { text_romanized_like: 'text' },
          ['text', 'text_romanized_like']
        )

        result.should.be.eql([
          {
            type: 'hash',
            attribute: 'text_romanized_like',
            operator: null,
            value: 'text'
          }
        ])
      })
    })

    it('works with a raw conditions', function() {
      return store.ready(function() {
        var User = store.Model('User')
        var result = store.utils.toConditionList(
          ['foo = ?', 'bar'],
          Object.keys(User.definition.attributes)
        )

        result.should.be.eql([
          {
            type: 'raw',
            query: 'foo = ?',
            args: ['bar']
          }
        ])
      })
    })

    it('converts placeholder in raw conditions', function() {
      return store.ready(function() {
        var User = store.Model('User')
        var result = store.utils.toConditionList(
          ['foo = :bar', { bar: 'blubb' }],
          Object.keys(User.definition.attributes)
        )

        result.should.be.eql([
          {
            type: 'raw',
            query: 'foo = ?',
            args: ['blubb']
          }
        ])
      })
    })
  })

  describe('hydrateJoinResult', function() {
    it('converts a single line to a nested object', function() {
      return store.ready(function() {
        var result = store.utils.hydrateJoinResult(
          [
            {
              f0: 1,
              f1: 'Foo',
              f2: 3,
              f3: 'bar'
            }
          ],
          {
            $primary: ['id'],
            id: 'f0',
            title: 'f1',
            bar: { $primary: ['id'], id: 'f2', title: 'f3' }
          }
        )

        result.should.be.eql([
          {
            id: 1,
            title: 'Foo',
            bar: [
              {
                id: 3,
                title: 'bar'
              }
            ]
          }
        ])
      })
    })

    it('converts a multiple lines to a nested object', function() {
      return store.ready(function() {
        var result = store.utils.hydrateJoinResult(
          [
            { f0: 1, f1: 'Foo', f2: 3, f3: 'bar' },
            { f0: 1, f1: 'Foo', f2: 1, f3: 'barbar' }
          ],
          {
            $primary: ['id'],
            id: 'f0',
            title: 'f1',
            bar: { $primary: ['id'], id: 'f2', title: 'f3' }
          }
        )

        result.should.be.eql([
          {
            id: 1,
            title: 'Foo',
            bar: [
              {
                id: 3,
                title: 'bar'
              },
              {
                id: 1,
                title: 'barbar'
              }
            ]
          }
        ])
      })
    })

    it('converts a multiple lines to multiple nested objects', function() {
      return store.ready(function() {
        var result = store.utils.hydrateJoinResult(
          [
            { f0: 1, f1: 'Foo', f2: 3, f3: 'bar' },
            { f0: 1, f1: 'Foo', f2: 1, f3: 'barbar' },
            { f0: 2, f1: 'Bar', f2: 1, f3: 'barbar' },
            { f0: 2, f1: 'Bar', f2: 2, f3: 'foo' }
          ],
          {
            $primary: ['id'],
            id: 'f0',
            title: 'f1',
            bar: { $primary: ['id'], id: 'f2', title: 'f3' }
          }
        )

        result.should.be.eql([
          {
            id: 1,
            title: 'Foo',
            bar: [
              {
                id: 3,
                title: 'bar'
              },
              {
                id: 1,
                title: 'barbar'
              }
            ]
          },
          {
            id: 2,
            title: 'Bar',
            bar: [
              {
                id: 1,
                title: 'barbar'
              },
              {
                id: 2,
                title: 'foo'
              }
            ]
          }
        ])
      })
    })
  })
})
