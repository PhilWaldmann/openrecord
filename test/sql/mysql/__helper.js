var exec = require('child_process').exec

global.beforeMYSQL = function(db, sql, next) {
  exec('mysql -u root -e "DROP DATABASE ' + db + '"', function(err, result) {
    // eslint-disable-line
    exec('mysql -u root -e "create database ' + db + '"', function(err) {
      // eslint-disable-line
      exec('mysql ' + db + ' -e "' + sql.join(';') + '" -u root', function(
        err,
        result
      ) {
        if (err) throw new Error(err)
        next()
      })
    })
  })
}

global.afterMYSQL = function(db, next) {
  next()
}

global.testMYSQL = function(name, queries, prefix) {
  var db = name.replace('/', '_') + '_test'
  require('../__shared/' + name + '-test' + (prefix || ''))(
    'SQL (MySQL)',
    function(next) {
      beforeMYSQL(db, queries, next)
    },
    function(next, store) {
      store.close(function() {})
      afterMYSQL(db, next)
    },
    {
      host: 'localhost',
      type: 'mysql',
      database: db,
      user: 'travis',
      password: ''
    }
  )
}
