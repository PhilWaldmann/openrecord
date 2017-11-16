var exec = require('child_process').exec
var PORT = ''

if(process.env.ORACLE_VIA_DOCKER){
  PORT = 49161
}

var CONN = "'travis/travis'@localhost"
if(PORT) CONN += ':' + PORT

// DROP ALL TABLES https://stackoverflow.com/questions/1690404/how-to-drop-all-user-tables

global.beforeOracle = function(db, sql, next){
  sql = sql.map(function(line){
    var tmp = line.match(/^PRIMARY:(\w+):(\w+)$/)
    if(tmp){
      return [
        'ALTER TABLE "' + tmp[1] + '" ADD (CONSTRAINT ' + tmp[1] + '_pk PRIMARY KEY ("' + tmp[2] + '"))',
        'CREATE SEQUENCE ' + tmp[1] + '_seq START WITH 1',
        'CREATE OR REPLACE TRIGGER ' + tmp[1] + '_seq_trigger\nBEFORE INSERT ON "' + tmp[1] + '"\nFOR EACH ROW\nBEGIN\n:new."' + tmp[2] + '" := ' + tmp[1] + '_seq.NEXTVAL;\nEND;\n/\n'
      ].join(';\n')
    }

    tmp = line.match(/INSERT INTO "(\w+)"\((.+)\) VALUES(.+)$/i)

    if(tmp){
      if(tmp[3].match(/\), \(/)){
        return tmp[3].replace(/\), \(/g, ')<!>(').split('<!>').map(function(values){
          return 'INSERT INTO "' + tmp[1] + '"(' + tmp[2] + ') VALUES' + values
        }).join(';\n')
      }
    }

    return line.replace(/TEXT/g, 'VARCHAR2(500)').replace(/INTEGER/g, 'NUMBER(10)').replace(/BOOLEAN/g, 'CHAR')
  })

  exec('cat ' + __dirname + '/clear.sql | sqlplus -L -S ' + CONN, function(err, result){ // eslint-disable-line
    if(err) console.log('ORACLE', err)
    // console.log(sql.join(';\n'))
    exec('sqlplus -L -S ' + CONN + ' <<SQL\n' + sql.join(';\n') + ';\nSQL', function(err, result){
      if(err) throw new Error(err)
      next()
    })
  })
}

global.afterOracle = function(db, next){
  next()
}

global.getOracleConfig = function(db, config){
  var host = 'localhost' + (PORT ? ':' + PORT : '')
  return Object.assign({
    // host: host,
    type: 'oracle',
    // database: 'XE',
    user: 'travis',
    password: 'travis',
    connectString: host + '/XE'
  }, config)
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
      if(store){
        store.close(function(){})
      }
      afterOracle(db, next)
    },
    getOracleConfig(db))
}
