var exec = require('child_process').exec;

global.beforeMYSQL = function(db, sql, next){
  exec('mysql -u travis -e "DROP DATABASE ' + db + '"', function(err, result){
    exec('mysql -u travis -e "create database ' + db + '"', function(err){
      exec('mysql ' + db + ' -e "' + sql.join(';') + '" -u travis', function(err, result){
        if(err) throw new Error(err);
        next();
      });
    });
  });
};

global.afterMYSQL = function(db, next){
  next();
};

global.testMYSQL = function(name, queries){
  var db = name.replace('/', '_') + '_test';
  require('../__shared/' + name + '-test')(
    'SQL (MySQL)',
    function(next){
      beforeMYSQL(db, queries, next);
    },
    function(next, store){
      store.close(function(){

      });
      afterMYSQL(db, next);
    },
    {
      host: 'localhost',
      type: 'mysql',
      database: db,
      user: 'travis',
      password: ''
  });
}
