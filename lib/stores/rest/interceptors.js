/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){

    /**
     * Will be called before every SQL find. This hook will be called by `Model.exec()`
     * @class Definition
     * @method beforeFind
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {object} options - The options object for the request
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Model
     *
     * @return {Definition}
     */
    this.addInterceptor('beforeFind');


    /**
     * Will be called before every create. This hook will be called by `Record.save()`
     * @class Definition
     * @method beforeCreate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} options - The options object for the request
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
     * @param {object} options - The options object for the request
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
     * @param {object} options - The options object for the request
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
     * @param {object} options - The options object for the request
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('beforeDestroy');

    /**
     * Will be called after every SQL find. This hook will be called by `Model.exec()`
     * @class Definition
     * @method afterFind
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {object} options - The options object for the request - with all its records.
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Model
     *
     * @return {Definition}
     */
    this.addInterceptor('afterFind');


    /**
     * Will be called after every create. This hook will be called by `Record.save()`
     * @class Definition
     * @method afterCreate
     * @param {function} callback - Your interceptor function
     *
     * @callback
     * @param {Record} record - The current record
     * @param {object} options - The options object for the request
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
     * @param {object} options - The options object for the request
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
     * @param {object} options - The options object for the request
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
     * @param {object} options - The options object for the request
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Record
     *
     * @return {Definition}
     */
    this.addInterceptor('afterDestroy');


  }
};
