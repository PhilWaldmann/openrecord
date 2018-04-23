var Store
try {
  Store = require('openrecord/store/sqlite3') // to simulate tests from the outside world
  require('openrecord/lib/base/dynamic_loading')
} catch (e) {
  Store = require('../../../store/sqlite3')
}

module.exports = function(database, autoAttributes) {
  const store = new Store({
    file: database,
    autoAttributes: autoAttributes
  })

  store.Model('user', function() {})
  store.Model('post', function() {})

  return store
}
