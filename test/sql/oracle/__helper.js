var exec = require('child_process').exec
var PORT = ''

if(process.env.ORACLE_VIA_DOCKER){
  PORT = 49161
}

var CONN = "'travis/travis'@localhost"
if(PORT) CONN += ':' + PORT

// DROP ALL TABLES https://stackoverflow.com/questions/1690404/how-to-drop-all-user-tables

global.beforeOracle = function(db, sql, next){
  exec('cat ' + __dirname + '/clear.sql | sqlplus -L -S ' + CONN, function(err, result){ // eslint-disable-line
    if(err) console.log('ORACLE', err)
    exec('sqlplus -L -S ' + CONN + ' <<SQL\n' + sql.join(';\n') + ';\nSQL', function(err, result){
      if(err) throw new Error(err)
      next()
    })
  })
}

global.afterOracle = function(db, next){
  next()
}

global.getOracleConfig = function(db){
  var host = 'localhost' + (PORT ? ':' + PORT : '')
  return {
    // host: host,
    type: 'oracle',
    // database: 'XE',
    user: 'travis',
    password: 'travis',
    connectString: host + '/XE'
  }
}

global.testOracle = function(name, queries){
  if(!process.env['ORACLE_HOME']){
    console.log('Needs Oracle database for tests.')
    return
  }

  var db = name.replace('/', '_') + '_test'
  require('../__shared/' + name + '-test')(
    'SQL (Oracle)',
    function(next){
      beforeOracle(db, queries, next)
    },
    function(next, store){
      store.close(function(){

      })
      afterOracle(db, next)
    },
    getOracleConfig(db))
}
