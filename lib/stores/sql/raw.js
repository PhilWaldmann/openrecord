/*
 * DEFINITION
 */
exports.model = {
  /**
   * execute raw sql
   * @class Model
   * @method raw
   * @param {string} sql - The raw sql query.
   * @param {array} attrs - Query attributes.
   * @param {function} callback - The callback.
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  raw: function(sql, attrs, callback) {
    var promise = this.definition.store.connection.raw(sql, attrs)

    if (typeof callback === 'function') {
      promise.then(callback)
    }

    return promise
  }
}
