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
     * @param {object} query - The internal knex instance
     * @param {function} done - Optional: If you need a async hook, just call `done()` when finished
     * @this Model
     *
     * @return {Definition}
     */
    this.addInterceptor('beforeFind');

    this.addInterceptor('onFind');

    /**
     * Will be called after every SQL find. This hook will be called by `Model.exec()`
     * @class Definition
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

    this.addInterceptor('beforeInclude');
    this.addInterceptor('onInclude');
    this.addInterceptor('afterInclude');

    this.addInterceptor('onHashCondition');
    this.addInterceptor('onRawCondition');
  }
};
