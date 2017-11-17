const Store = require('../../../lib/store')

module.exports = function(database){
  const store = new Store({
    type: 'sqlite3',
    file: database
  })

  store.Model('user', function(){})
  store.Model('post', function(){})

  return store
}
