var sqlite = require('sqlite3');
var fs = require('fs');
var async = require('async');

global.beforeSql = function(file, sql, next){
  db = new sqlite.Database(file);
  
  var tmp = [];
  for(var i in sql){
    (function(sql){
      tmp.push(function(next){
        db.run(sql, next);
      });
    })(sql[i]);
  }
  
  async.parallel(tmp, next);
};

global.afterSql = function(file){
  fs.unlinkSync(file);
};