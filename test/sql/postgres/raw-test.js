var Store = require('../../../store/postgres')

describe('Postgres: Raw Query', function() {
  var store
  var database = 'raw_test'

  before(function(next) {
    this.timeout(5000)
    beforePG(
      database,
      [
        'CREATE TABLE users(id serial primary key, login TEXT NOT NULL, email TEXT)',
        "INSERT INTO users(login, email) VALUES('phil', 'phil@mail.com')"
      ],
      next
    )
  })

  before(function() {
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: ''
    })

    store.Model('user', function() {})
  })

  after(function(next) {
    afterPG(database, next)
  })

  it('raw() runs the raw sql query', function() {
    return store.ready(function() {
      var User = store.Model('User')

      return User.raw('SELECT COUNT(*) FROM users').then(function(result) {
        result.rows.should.be.eql([{ count: 1 }])
      })
    })
  })
})
