var Store
try{
  Store = require('openrecord/store/postgres') // to simulate tests from the outside world
}catch(e){
  Store = require('../../../store/postgres')
}

module.exports = function(database, disableAutoload){
  const store = new Store({
    host: 'localhost',
    type: 'postgres',
    database: database,
    user: 'postgres',
    password: '',
    disableAutoload: disableAutoload,
    disableAutoConnect: true
  })

  store.Model('user', function(){})
  store.Model('post', function(){})

  return store
}
