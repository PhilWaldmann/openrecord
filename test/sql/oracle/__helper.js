var exec = require('child_process').exec

global.beforeOracle = function(db, sql, next){
  exec('$ORACLE_HOME/bin/sqlplus -L -S / AS SYSDBA "DROP DATABASE ' + db + '"', function(err, result){ // eslint-disable-line
    console.log('DROP', db, result)
    if(err) console.log('ORACLE', err)
    exec('$ORACLE_HOME/bin/sqlplus -L -S / AS SYSDBA "create database ' + db + '"', function(err){ // eslint-disable-line
      console.log('CREATE', db, result)
      if(err) console.log('ORACLE', err)
      exec('$ORACLE_HOME/bin/sqlplus -L -S / AS SYSDBA "USE ' + db + ';' + sql.join(';') + '"', function(err, result){
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
      host: 'localhost',
      type: 'oracle',
      database: db,
      user: 'travis',
      password: 'travis'
    })
}
