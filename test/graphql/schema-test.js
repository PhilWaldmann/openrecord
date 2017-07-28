// var should = require('should')
var path = require('path')
var Store = require('../../lib/store')

describe('Graphql: Schema', function(){
  var store
  var database = path.join(__dirname, 'graphql_test.sqlite3')


  before(function(next){
    beforeSQLite(database, [
      'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login, email TEXT, active BOOLEAN)',
      'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
      'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
      // "COMMENT ON COLUMN users.login IS 'User login name'",
      'INSERT INTO users(login, email, active) VALUES("phil", "phil@mail.com", 1), ("michl", "michl@mail.com", 0), ("admin", "admin@mail.com", 1)',
      'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
      'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")'
    ], next)
  })

  before(function(){
    store = new Store({
      type: 'sqlite3',
      file: database,
      graphql: true
    })
      .graphList('users')
      .graphGet('user')
      .graphGet('user_count', {model: 'User', scope: 'count'})
      // .graphGet('userCount', function(){
      //   return this.model('User').count
      // })

    store.Model('User', function(){
      this.hasMany('posts')
      this.hasMany('threads')
      this.hasMany('last_posts', {model: 'Post', scope: 'recent'})
      this.has('post_count', {model: 'Post', scope: 'count'})


      this.scope('list', function(args){
        var page = args.page || 1
        var limit = args.limit || 20
        if(page < 1) page = 1

        this.limit(limit, (page - 1) * limit)
      }, {
        description: 'List all users',
        args: {
          limit: 'integer',
          page: 'integer'
        }
      })

      this.attributes.login.description = 'foobar'

      this.getter('full_name', function(){
        return this.login + ' FULL'
      }, String)


      this.method('post_count2', function(){
        return this.posts.count().exec()
      }, {
        return_type: 'integer'
      })


      this.variant('email', function(value, args){
        if(args.domain) return value.replace(/.+@/, '')
        if(args.username) return value.replace(/@.+/, '')
        return value
      }, {
        domain: 'boolean',
        username: 'boolean'
      })
    })
    store.Model('Post', function(){
      this.belongsTo('user')
      this.belongsTo('thread')

      this.scope('recent', function(){
        this.limit(1)
      })
    })
    store.Model('Thread', function(){
      this.belongsTo('user')
      this.hasMany('posts')
    })
  })

  after(function(){
    afterSQLite(database)
  })


  it('store has a query function', function(){
    store.query.should.be.a.Function()
  })

  it('returns a single record', function(done){
    store.ready(function(){
      store.query(`{
        user(id: 1){
          login
        }
      }`).then(result => {
        result.should.be.eql({ data: { user: { login: 'phil' } } })
        done()
      })
    })
  })


  it('returns all records', function(done){
    store.ready(function(){
      store.query(`{
        users{
          login
          full_name
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            users: [
              { login: 'phil', full_name: 'phil FULL' },
              { login: 'michl', full_name: 'michl FULL' },
              { login: 'admin', full_name: 'admin FULL' }
            ]
          }
        })
        done()
      })
    })
  })


  it('returns a single value (count)', function(done){
    store.ready(function(){
      store.query(`{
        user_count
      }`).then(result => {
        result.should.be.eql({ data: { user_count: 3 } })
        done()
      })
    })
  })


  it('returns a single record and the total count', function(done){
    store.ready(function(){
      store.query(`{
        user_count
        users{
          login
          full_name
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            user_count: 3,
            users: [
              { login: 'phil', full_name: 'phil FULL' },
              { login: 'michl', full_name: 'michl FULL' },
              { login: 'admin', full_name: 'admin FULL' }
            ]
          }
        })
        done()
      })
    })
  })


  it('returns first 2 records', function(done){
    store.ready(function(){
      store.query(`{
        users(limit: 2){
          login
          full_name
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            users: [
              { login: 'phil', full_name: 'phil FULL' },
              { login: 'michl', full_name: 'michl FULL' }
            ]
          }
        })
        done()
      })
    })
  })


  it('returns records with relation count', function(done){
    store.ready(function(){
      store.query(`{
        users{
          login
          post_count
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            users: [
              { login: 'phil', post_count: 3 },
              { login: 'michl', post_count: 1 },
              { login: 'admin', post_count: 0 }
            ]
          }
        })
        done()
      })
    })
  })



  it('returns records with relation count(field: "thread_id" distinct: true)', function(done){
    store.ready(function(){
      store.query(`{
        users{
          login
          post_count(field: "thread_id" distinct: true)
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            users: [
              { login: 'phil', post_count: 2 },
              { login: 'michl', post_count: 1 },
              { login: 'admin', post_count: 0 }
            ]
          }
        })
        done()
      })
    })
  })


  it('returns records with custom method', function(done){
    store.ready(function(){
      store.query(`{
        users{
          login
          post_count2
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            users: [
              { login: 'phil', post_count2: 3 },
              { login: 'michl', post_count2: 1 },
              { login: 'admin', post_count2: 0 }
            ]
          }
        })
        done()
      })
    })
  })


  it('returns a record with relational data', function(done){
    store.ready(function(){
      store.query(`{
        users{
          login
          posts{
            id
            thread_id
            message
          }
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            users: [
              {
                login: 'phil',
                posts: [
                  { id: 1, thread_id: 1, message: 'first message' },
                  { id: 2, thread_id: 1, message: 'second' },
                  { id: 3, thread_id: 2, message: 'third' }
                ]
              },
              {
                login: 'michl',
                posts: [
                  { id: 4, thread_id: 1, message: 'michls post' }
                ]
              },
              {
                login: 'admin',
                posts: []
              }
            ]
          }
        })
        done()
      })
    })
  })


  it('returns a record with deeply nested relational data', function(done){
    store.ready(function(){
      store.query(`{
        users{
          login
          posts{
            message
            thread{
              title
              user{
                email(username: true)
              }
            }
          }
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            users: [
              {
                login: 'phil',
                posts: [
                  {
                    message: 'first message',
                    thread: { title: 'first thread', user: { email: 'michl' } }
                  },
                  {
                    message: 'second',
                    thread: { title: 'first thread', user: { email: 'michl' } }
                  },
                  {
                    message: 'third',
                    thread: { title: 'second thread', user: { email: 'phil' } }
                  }
                ]
              },
              {
                login: 'michl',
                posts: [
                  {
                    message: 'michls post',
                    thread: { title: 'first thread', user: { email: 'michl' } }
                  }
                ]
              },
              {
                login: 'admin',
                posts: []
              }
            ]
          }
        })
        done()
      })
    })
  })



  it('returns a record with scoped relational data ', function(done){
    store.ready(function(){
      store.query(`{
        users{
          login
          last_posts{
            id
            thread_id
            message
          }
        }
      }`).then(result => {
        result.should.be.eql({
          data: {
            users: [
              {
                login: 'phil',
                last_posts: [
                  { id: 1, thread_id: 1, message: 'first message' }
                ]
              },
              {
                login: 'michl',
                last_posts: [
                  { id: 4, thread_id: 1, message: 'michls post' }
                ]
              },
              {
                login: 'admin',
                last_posts: []
              }
            ]
          }
        })
        done()
      })
    })
  })
})
