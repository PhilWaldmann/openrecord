var sqlite = require('sqlite3')
var fs = require('fs')
var async = require('async')

global.beforeSQLite = function(file, sql, next){
  afterSQLite(file)

  var db = new sqlite.Database(file)

  var tmp = []
  for(var i in sql){
    (function(sql){
      tmp.push(function(next){
        // convert mysql or postgres sql to sqlite3 format
        sql = sql
          .replace('serial primary key', 'INTEGER PRIMARY KEY AUTOINCREMENT')
          .replace(/VALUES\(.+\)/, function(values){
            return values
              .replace(/'/g, '"')
              .replace(/true/g, '1')
              .replace(/false/g, '0')
          })

        db.run(sql, next)
      })
    })(sql[i])
  }

  async.series(tmp, next)
}

global.afterSQLite = function(file){
  if(fs.existsSync(file)) fs.unlinkSync(file)
}


global.testSQLite = function(name, queries){
  var db = name.replace('/', '_') + '_test'

  require('../__shared/' + name + '-test')(
    'SQL (SQLite3)',
    function(next){
      beforeSQLite(db, queries, next)
    },
    function(next){
      afterSQLite(db)
      next()
    },
    {
      type: 'sqlite3',
      file: db
    })
}
