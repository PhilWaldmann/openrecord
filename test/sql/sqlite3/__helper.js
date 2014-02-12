var sqlite = require('sqlite3');
var fs = require('fs');
var async = require('async');

global.beforeSQLite = function(file, sql, next){
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
  fs.unlinkSync(file);
};