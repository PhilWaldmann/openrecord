var exec = require('child_process').exec;

global.beforePG = function(db, sql, next){
  exec('psql -c "DROP DATABASE ' + db + '" -U postgres', function(err, result){
    exec('psql -c "create database ' + db + '" -U postgres', function(err){
      exec('psql ' + db + ' -c "' + sql.join(';') + '" -U postgres', function(err, result){
        if(err) throw new Error(err);
        next();
      });    
    });
  });
};

global.afterPG = function(db, next){
  next();
};