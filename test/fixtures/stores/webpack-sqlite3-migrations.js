var Store
try {
  Store = require('openrecord/store/sqlite3') // to simulate tests from the outside world
} catch (e) {
  Store = require('../../../store/sqlite3')
}

module.exports = function(database, autoAttributes) {
  const store = new Store({
    file: database,
    autoAttributes: autoAttributes,
    migrations: [
      require('../migrations/20140223120815_create_users')
    ]
  })

  store.Model('User', function() {})

  return store
}
