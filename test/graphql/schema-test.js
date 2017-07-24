// var should = require('should')
var path = require('path')
var Store = require('../../lib/store')

describe('Graphql: Schema', function(){
  var store
  var database = path.join(__dirname, 'graphql_test.sqlite3')


  before(function(next){
    beforeSQLite(database, [
      'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, active BOOLEAN)',
      'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
      'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
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

    store.Model('User', function(){
      this.hasMany('posts')
      this.hasMany('threads')

      this.getter('full_name', function(){
        return this.login + ' FULL'
      }, String)
    })
    store.Model('Post', function(){
      this.belongsTo('user')
      this.belongsTo('thread')
    })
    store.Model('Thread', function(){
      this.belongsTo('user')
      this.hasMany('posts')
    })

    // store.graphql(function(){
    //
    // })
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
                email
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
                    thread: { title: 'first thread', user: { email: 'michl@mail.com' } }
                  },
                  {
                    message: 'second',
                    thread: { title: 'first thread', user: { email: 'michl@mail.com' } }
                  },
                  {
                    message: 'third',
                    thread: { title: 'second thread', user: { email: 'phil@mail.com' } }
                  }
                ]
              },
              {
                login: 'michl',
                posts: [
                  {
                    message: 'michls post',
                    thread: { title: 'first thread', user: { email: 'michl@mail.com' } }
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
})
