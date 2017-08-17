var exec = require('child_process').exec
var PORT = process.env.ORACLE_PORT || ''
if(PORT) PORT = ':' + PORT

global.beforeOracle = function(db, sql, next){
  exec('echo "DROP DATABASE ' + db + '" | sqlplus -L -S \'system/oracle\'@localhost' + PORT, function(err, result){ // eslint-disable-line
    console.log('DROP', db, result)
    if(err) console.log('ORACLE', err)
    exec('echo "create database ' + db + '" | sqlplus -L -S \'system/oracle\'@localhost' + PORT, function(err){ // eslint-disable-line
      console.log('CREATE', db, result)
      if(err) console.log('ORACLE', err)
      exec('echo "' + sql.join(';') + '" | sqlplus -L -S \'system/oracle\'@localhost' + PORT, function(err, result){
        console.log('EXEC', db, result)
        if(err) throw new Error(err)
        next()
      })
    })
  })
}

global.afterOracle = function(db, next){
  next()
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
    {
      host: 'localhost' + PORT,
      type: 'oracle',
      database: db,
      user: 'travis',
      password: 'travis',
      connection: {
        connectString: 'localhost/XE'
      }
    })
}
