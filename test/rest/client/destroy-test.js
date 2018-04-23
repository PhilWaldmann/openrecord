var Store = require('../../../lib/store')

describe('REST Client: Destroy', function() {
  var store

  before(function() {
    store = new Store({
      type: 'rest',
      url: 'http://localhost:8889',
      version: '~1.0'
    })

    store.Model('User', function() {
      this.attribute('id', Number, { primary: true })
      this.attribute('login', String)
      this.attribute('email', String)
    })
  })

  it('destroys a record (destroy)', function() {
    return store.ready(function() {
      var User = store.Model('User')
      return User.find(3).exec(function(record) {
        record.id.should.be.equal(3)
        return record.destroy()
      })
    })
  })
})
