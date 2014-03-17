var exec = require('child_process').exec;

global.beforePG = function(db, sql, next){
  /*exec('psql -c "SELECT pid FROM pg_stat_activity where pid <> pg_backend_pid()" -U postgres', function(err, result){
    console.log('Connected', result);
  });*/
  exec('psql -c "DROP DATABASE ' + db + '" -U postgres', function(err, result){
    exec('psql -c "create database ' + db + '" -U postgres', function(err, result){
      console.log(err, result);
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

global.testPG = function(name, queries){
  var db = name.replace('/', '_') + '_test';
  require('../__shared/' + name + '-test')(
    'Postgres', 
    function(next){
      beforePG(db, queries, next);
    },
    function(next, store){
      store.close(function(){
        
      });
      afterPG(db, next);
    },
    {
      host: 'localhost',
      type: 'postgres',
      database: db,
      user: 'postgres',
      password: ''
  });
}