/*
 * STORE
 */
exports.store = {    
  mixinCallback: function(){
    

    
        
    /**
     * Will be called before every create. This hook will be called by `Record.save()`
     * @class Definition
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
     * @class Definition
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
     * @class Definition
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
     * @class Definition
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
     * Will be called after every create. This hook will be called by `Record.save()`
     * @class Definition
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
     * @class Definition
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
     * @class Definition
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
     * @class Definition
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
    
    
    
    /**
     * ## beforeFind
     * ### Priorities
     * 
     * priority | file | responsibility
     * --- | --- | ---
     * -10 | includes | creates joins if necessary
     * -20 | joins | adds joins
     * -30 | aggregate_functions | adds `COUNT`, `SUM`, `MIN`, `MAX`
     * -40 | limit | adds limit and offset
     * -50 | select | maps table fields to numbers on joins
     * -60 | order | sets `ORDER BY`
     * -70 | conditions | created the `WHERE` clause
     * -80 | transaction | set a transaction
     * 
     * 
     * 
     * ## afterFind
     * ### Priorities
     * 
     * priority | file | responsibility
     * --- | --- | ---
     * 100 | select | on a join, it replaces all the fields (f0 ... fN) with the correct names
     * 90 | joins | on a join, it combines duplicate lines into one record - for the base and all it's subrecords
     * 80 | includes | creates additional queries for included relations
     * 70 | aggregate_functions | calls `asJson()` if any aggregate function was used
     * 60 | save | sets `__exists` attribute to `true` on all loaded records
     * 50 | collection | turns the json objects into records unless `asJson()` was called
     * 40 | limit | returns a single record instead of an array if limit was 1
     * 
     * ## beforeCreate
     * ### Priorities
     * 
     * priority | file | responsibility
     * --- | --- | ---
     * 100 | relations | saves related records
     *
     * @name Internal interceptors & Priorities
     * @private
     */ 
    
    
  }
};