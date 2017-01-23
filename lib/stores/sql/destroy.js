var async = require('async');
var Store = require('../../store');

/*
 * RECORD
 */
exports.record = {


  /**
   * Destroy a record
   *
   * @class Record
   * @method destroy
   * @param {function} callback - The destroy callback
   *
   * @callback
   * @param {boolean} result - will be true if the destroy was successful
   * @this Record
   *
   * @return {Record}
   */
  destroy: function(options, resolve, reject){
    var self = this;
    var query = this.definition.query();
    var primary_keys = this.definition.primary_keys;
    var condition = {};

    if(typeof options == 'function'){
      reject = resolve;
      resolve = options;
      options = null;
    }


    options = options || {};
    //callback = callback.bind(this);

    for(var i = 0; i < primary_keys.length; i++){
      condition[primary_keys[i]] = this[primary_keys[i]];
    }

    return self.promise(function(resolve, reject){

      self.transaction(options, function(){

        self.callInterceptors('beforeDestroy', [self, options.transaction], function(okay){
          if(okay){
            query.transacting(options.transaction).where(condition).delete().asCallback(function(err){
              self.logger.info(query.toString());

              if(err){
                options.transaction.rollback('exception');
                return reject(new Store.SQLError(err));
              }

              self.callInterceptors('afterDestroy', [self, options.transaction], function(okay){
                if(okay){
                  if(options.commit !== false){
                    options.transaction.commit();
                    options.transaction_promise.then(function(){
                      resolve(true);
                    });
                  }else{
                    resolve(true);
                  }
                }else{
                  if(options.rollback !== false){
                    options.transaction.rollback('afterDestroy');
                  }
                  resolve(false);
                }
              }, reject);
            });

          }else{
            if(options.rollback !== false){
              options.transaction.rollback('beforeDestroy');
            }
            resolve(false);
          }
        }, reject);

      });

    }, resolve, reject);
  },










  /**
   * Deletes the record. beforeDestroy and afterDestroy want be called!
   * Be careful with relations: The `dependent` option is not honored
   *
   * @class Record
   * @method delete
   * @param {function} callback - The delete callback
   *
   * @callback
   * @param {boolean} result - will be true if the delete was successful
   * @this Record
   *
   * @return {Record}
   */
  'delete': function(options, resolve, reject){
    var self = this;
    var query = this.definition.query();
    var primary_keys = this.definition.primary_keys;
    var condition = {};

    if(typeof options == 'function'){
      reject = resolve;
      resolve = options;
      options = null;
    }



    options = options || {};
    //callback = callback.bind(this);

    return self.promise(function(resolve, reject){

      for(var i = 0; i < primary_keys.length; i++){
        condition[primary_keys[i]] = self[primary_keys[i]];
      }

      if(options.transaction){
        query.transacting(options.transaction);
      }

      query.where(condition).delete().asCallback(function(err, a){
        self.logger.info(query.toString());

        if(err){
          return reject(new Store.SQLError(err));
        }

        resolve(true);
      });

    }, resolve, reject);
  }

};




/*
 * MODEL
 */
exports.model = {

  /**
   * Deletes all records which match the conditions. beforeDestroy and afterDestroy want be called!
   * Be careful with relations: The `dependent` option is not honored
   *
   * @class Model
   * @method deleteAll
   * @alias delete
   *
   * @callback
   * @param {boolean} success - Returns true if the delete was successfull
   * @this Collection
   *
   * @return {Model}
   */
  'delete': function(options, resolve, reject){
    return this.deleteAll(options, resolve, reject);
  },
  deleteAll: function(options, resolve, reject){
    var self = this.chain();

    if(typeof options == 'function'){
      reject = resolve;
      resolve = options;
      options = null;
    }


    //callback = callback.bind(self);

    var query = self.query;

    return self.promise(function(resolve, reject){

      if(options && options.transaction){
        query.transacting(options.transaction);
      }

      self.callInterceptors('beforeFind', [query], function(okay){
        if(okay){

          query.delete().asCallback(function(err, resp) {
            self.logger.info(query.toString());

            if(err){
              return reject(new Store.SQLError(err));
            }

            resolve(true);

          });
        }else{
          resolve(false, 0);
        }
      }, reject);

    }, resolve, reject);

  },





  /**
   * Loads all records at first and calls destroy on every single record. All hooks are fired and relations will be deleted if configured via options `dependent`
   *
   * @class Model
   * @method destroyAll
   * @alias destroy
   *
   * @callback
   * @param {boolean} success - Returns true if the delete was successfull
   * @this Collection
   *
   * @return {Model}
   */
  destroy: function(options, resolve, reject){
    return this.destroyAll(options, resolve, reject);
  },
  destroyAll: function(options, resolve, reject){
    var self = this.chain();

    if(typeof options == 'function'){
      reject = resolve;
      resolve = options;
      options = null;
    }

    //callback = callback.bind(self);

    return self.promise(function(resolve, reject){

      if(options && options.transaction){
        self.transaction(options.transaction);
      }

      self.exec(function(records){
        var tmp = [];
        var affected = 0;

        self.each(function(record){
          tmp.push(function(next){
            record.destroy(options, function(success){
              if(success) affected+=1;
              next();
            }, reject);
          });
        });

        if(tmp.length == 0){
          return resolve(true);
        }

        async.series(tmp, function(){
          resolve(tmp.length === affected);
        });
      }, reject);

    }, resolve, reject);
  }
};
