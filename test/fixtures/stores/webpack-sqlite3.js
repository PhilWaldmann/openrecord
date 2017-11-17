const Store = require('../../../store/sqlite3')

module.exports = function(database){
  const store = new Store({
    file: database
  })

  store.Model('user', function(){})
  store.Model('post', function(){})

  return store
}
