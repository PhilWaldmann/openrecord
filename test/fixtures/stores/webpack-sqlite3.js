var Store
try{
  Store = require('openrecord/store/sqlite3') // to simulate tests from the outside world
}catch(e){
  Store = require('../../../store/sqlite3')
}

module.exports = function(database, diableautoload){
  const store = new Store({
    file: database,
    diableAutoload: diableautoload
  })

  store.Model('user', function(){})
  store.Model('post', function(){})

  return store
}
