var exec = require('child_process').exec
var PORT = ''

if(process.env.ORACLE_VIA_DOCKER){
  PORT = 49161
}

var CONN = "'travis/travis'@localhost"
if(PORT) CONN += ':' + PORT

// DROP ALL TABLES https://stackoverflow.com/questions/1690404/how-to-drop-all-user-tables

/*
  For local oracle tests:
  1. download oracle docker image (wnameless/oracle-xe-11g)
  2. Download oracle instantclient (SQLPlus). (in this case ~/Desktop/instantclient_12_1)
  3. $ OCI_INC_DIR=~/Desktop/instantclient_12_1/sdk/include OCI_LIB_DIR=~/Desktop/instantclient_12_1 LD_LIBRARY_PATH=~/Desktop/instantclient_12_1 npm i oracledb --save-dev
  4. $ mkdir ~/lib
  5. $ ln -s ~/Desktop/instantclient_12_1/libclntsh.dylib.12.1 ~/lib/
  3. $ docker run -d -p 49160:22 -p 49161:1521 -p 46162:8080 -e ORACLE_ALLOW_REMOTE=true wnameless/oracle-xe-11g 
  4. $ export PATH=~/Desktop/instantclient_12_1:$PATH
  5. $ ORACLE_SID=XE sqlplus -L -S 'system/oracle'@localhost:49161  <<SQL
CREATE USER travis IDENTIFIED BY travis;
GRANT CONNECT, RESOURCE TO travis;
GRANT EXECUTE ON SYS.DBMS_LOCK TO travis;
SQL
  5. ORACLE_VIA_DOCKER=1 ORACLE_HOME=1 npm run mocha
*/

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

global.testOracle = function(name, queries, prefix){
  if(!process.env['ORACLE_HOME']){
    console.log('Needs Oracle database for tests.')
    return
  }
  return

  var db = name.replace('/', '_') + '_test'
  require('../__shared/' + name + '-test' + (prefix || ''))(
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
