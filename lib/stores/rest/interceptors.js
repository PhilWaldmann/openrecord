/*
 * STORE
 */
exports.store = {    
  mixinCallback: function(){
    
    /**
     * Will be called before every SQL find. This hook will be called by `Model.exec()`
     * @section Definition/Hooks
     * @method beforeFind
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {object} query - The internal knex instance
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Model
     *
     * @return {Definition}
     */ 
    this.addInterceptor('beforeFind');
    
    
    /**
     * Will be called before every create. This hook will be called by `Record.save()`
     * @section Definition/Hooks
     * @method beforeCreate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('beforeCreate');
    
    /**
     * Will be called before every update. This hook will be called by `Record.save()`
     * @section Definition/Hooks
     * @method beforeUpdate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('beforeUpdate');
    
    /**
     * Will be called before every create or update. This hook will be called by `Record.save()`
     * @section Definition/Hooks
     * @method beforeSave
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('beforeSave');
    
    /**
     * Will be called before every destroy. This hook will be called by `Record.destroy()`
     * @section Definition/Hooks
     * @method beforeDestroy
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('beforeDestroy');
    
    /**
     * Will be called after every SQL find. This hook will be called by `Model.exec()`
     * @section Definition/Hooks
     * @method afterFind
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} query - The raw result object
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Model
     *
     * @return {Definition}
     */ 
    this.addInterceptor('afterFind');

    
    /**
     * Will be called after every create. This hook will be called by `Record.save()`
     * @section Definition/Hooks
     * @method afterCreate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('afterCreate');
    
    /**
     * Will be called after every update. This hook will be called by `Record.save()`
     * @section Definition/Hooks
     * @method afterUpdate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('afterUpdate');
    
    /**
     * Will be called after every create or update. This hook will be called by `Record.save()`
     * @section Definition/Hooks
     * @method afterSave
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('afterSave');
    
    /**
     * Will be called after every destroy. This hook will be called by `Record.destroy()`
     * @section Definition/Hooks
     * @method afterDestroy
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} transaction - The internal knex transaction
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('afterDestroy');
    
    
  }
};