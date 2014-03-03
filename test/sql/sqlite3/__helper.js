var sqlite = require('sqlite3');
var fs = require('fs');
var async = require('async');

global.beforeSQLite = function(file, sql, next){
  afterSQLite(file);
  
  db = new sqlite.Database(file);
  
  var tmp = [];
  for(var i in sql){
    (function(sql){
      tmp.push(function(next){
        db.run(sql, next);
      });
    })(sql[i]);
  }
  
  async.series(tmp, next);
};

global.afterSQLite = function(file){
  if(fs.existsSync(file)) fs.unlinkSync(file);
};


global.testSQLite = function(name, queries){
  var db = name.replace('/', '_') + '_test';
  
  require('../__shared/' + name + '-test')(
    'SQLite3', 
    function(next){
      beforeSQLite(db, queries, next);
    },
    function(next){
      afterSQLite(db);
      next();
    },
    {
      type: 'sqlite3',
      file: db
  });
}