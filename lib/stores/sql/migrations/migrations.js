var path  = require('path');
var async = require('async');
var Utils = require('../../../utils');
var Store = require('../../../store');

exports.definition = {
  mixinCallback: function(){
    var store = this.store;

    this.use(function(next){

      if(!store.migrations_running){
        store.runMigrations();
      }
      
      //put that one after loadMigrations to finish the middleware without any async stuff if there is no connection - or migration
      if(store.migrations_finished){
        return next();
      }
      
      store.once('migrations_finished', next);
      
    }, 100);
  }
};



exports.store = {
  mixinCallback: function(){
    this.migration_table = this.config.migration_table || 'openrecord_migrations';
    this.migrations = [];
    
    if(this.config.migrations && typeof this.config.migrations == 'string'){
      this.loadMigrations(this.config.migrations);
    }
  },
  
  
  Migration: function(name, fn){
    this.migrations.push({name:name, fn:fn});
  },
  
  
  
  loadMigrations: function(loadpath){
    var migrations = Utils.require(loadpath, {includePathNames: true});
  
    for(var fullpath in migrations){
      if(migrations.hasOwnProperty(fullpath) && typeof migrations[fullpath] == 'function'){
        var migration_name = path.basename(fullpath, path.extname(fullpath));
      
        this.Migration(migration_name, migrations[fullpath]);
      }
    }
  },
  
  
  
  runMigrations: function(){
    this.migrations_running = true;
    
    if(!this.connection || this.migrations.length == 0){
      this.migrations_finished = true;
      this.migrations_running = false;
      return;
    }
    
    var self = this;
    this.loadMigrationHistory(function(finished_migrations){
      self.runMissingMigrations(finished_migrations, function(){
        self.migrations_finished = true;
        self.migrations_running = false;
        self.emit('migrations_finished');
      });
    });
  },
  
  
  
  loadMigrationHistory: function(callback){
    var self = this;
    
    this.connection.schema.hasTable(this.migration_table).then(function(exists){
      if(exists){

        self.connection(self.migration_table).then(function(result){
          var names = [];
          
          for(var i = 0; i < result.length; i++){
            names.push(result[i].name);
          }

          callback(names);
        });
      }else{
        self.connection.schema.createTable(self.migration_table, function(table){
          table.string('name');
        }).then(function(){
          callback([]);
        });
      }
    });
  },
  
  
  
  runMissingMigrations: function(finished_migrations, callback){
    var missing = [];
    var self = this;
    
    var Migration = {connection: this.connection, store: this};
    Utils.mixin(Migration, this.mixinPaths, {only: 'migration'});
    Utils.mixinCallbacks(Migration, {});
    
    
    //Migrations are handled in series
    //First the migration method will be called
    //for every operation a new queue item will be added
    //after that, we'll execute the queue
    for(var i = 0; i < this.migrations.length; i++){
      if(finished_migrations.indexOf(this.migrations[i].name) == -1){
        (function(fn, name){
          missing.push(function(done){
            var queue = [];
            Migration.queue = queue;
            
            try{
              
              Migration.startTransaction();
              fn.call(Migration);
              Migration.commit();
              
              //Run the operation queue
              async.series(queue, function(err){
                if(err) return done(err);
                self.connection(self.migration_table).insert({name:name}).then(function(){
                  done();
                }, function(err){
                  done(err);
                });
                
              });
            }catch(e){
              done(e);
            }
            
          });
        })(this.migrations[i].fn, this.migrations[i].name);
      }
    }
    
    async.series(missing, function(err){
      if(err){
        Migration.rollback();
        console.log('ROLLBACK', err);
      }
      callback();
    });
    
  }
  
};