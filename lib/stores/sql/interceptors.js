/*
 * STORE
 */
exports.store = {    
  mixinCallback: function(){
    
    /**
     * Will be called before every SQL find. This hook will be called by `Model.exec()`
     * @area Definition/Hooks
     * @method beforeFind
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @scope Model
     *
     * @return {Definition}
     */ 
    this.addInterceptor('beforeFind');
    
    /**
     * Will be called before every create. This hook will be called by `Record.save()`
     * @area Definition/Hooks
     * @method beforeCreate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @scope Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('beforeCreate');
    
    /**
     * Will be called before every update. This hook will be called by `Record.save()`
     * @area Definition/Hooks
     * @method beforeUpdate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @scope Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('beforeUpdate');
    
    /**
     * Will be called before every create or update. This hook will be called by `Record.save()`
     * @area Definition/Hooks
     * @method beforeSave
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @scope Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('beforeSave');
    
    /**
     * Will be called before every destroy. This hook will be called by `Record.destroy()`
     * @area Definition/Hooks
     * @method beforeDestroy
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @scope Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('beforeDestroy');
    
    /**
     * Will be called after every SQL find. This hook will be called by `Model.exec()`
     * @area Definition/Hooks
     * @method afterFind
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @scope Model
     *
     * @return {Definition}
     */ 
    this.addInterceptor('afterFind');
    
    /**
     * Will be called after every create. This hook will be called by `Record.save()`
     * @area Definition/Hooks
     * @method afterCreate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @scope Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('afterCreate');
    
    /**
     * Will be called after every update. This hook will be called by `Record.save()`
     * @area Definition/Hooks
     * @method afterUpdate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @scope Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('afterUpdate');
    
    /**
     * Will be called after every create or update. This hook will be called by `Record.save()`
     * @area Definition/Hooks
     * @method afterSave
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @scope Record
     *
     * @return {Definition}
     */ 
    this.addInterceptor('afterSave');
    
    /**
     * Will be called after every destroy. This hook will be called by `Record.destroy()`
     * @area Definition/Hooks
     * @method afterDestroy
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @scope Record
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
     * 100 | includes | creates joins if necessary
     * 90 | joins | adds joins
     * 80 | aggregate_functions | adds `COUNT`, `SUM`, `MIN`, `MAX`
     * 70 | limit | adds limit and offset
     * 60 | select | maps table fields to numbers on joins
     * 50 | order | sets `ORDER BY`
     * 40 | conditions | created the `WHERE` clause
     * 
     * 
     * 
     * ## afterFind
     * ### Priorities
     * 
     * priority | file | responsibility
     * --- | --- | ---
     * 100 | select | on a join, it replaces all the fields (f0 ... fN) with the correct names
     * 90 | joins | on a join, it combines duplicate lines into one record - for the base an all it's subrecords
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
    
    
  },
};