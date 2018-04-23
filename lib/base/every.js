/*
 * CHAIN
 */
exports.chain = {
  mixinCallback: function() {
    /**
     * You could call `.every` on every Collection of records to get a special Record (PseudoRecord).
     * This PseudoRecord has all the properties and methods a normal Record of this Model has, but it will behave different
     * E.g. getting an attributes value `Collection.every.id` will return an array of all record's ids.
     * The same will work with setting an attribute or calling a method.
     *
     * @class Collection
     * @name .every
     *
     * @return {PseudoRecord}
     */

    // returns a pseudo record
    this.__defineGetter__('every', function() {
      var self = this
      var pseudo = new this.model() // eslint-disable-line

      for (var name in pseudo) {
        ;(function(name, value) {
          if (typeof value === 'function') {
            // replace methods
            pseudo[name] = function() {
              for (var i = 0; i < self.length; i++) {
                var record = self[i]
                record[name].apply(record, arguments)
              }
            }
          } else {
            // replace attribute
            pseudo.__defineGetter__(name, function() {
              var tmp = []
              for (var i = 0; i < self.length; i++) {
                var record = self[i]
                tmp.push(record[name])
              }
              return tmp
            })

            pseudo.__defineSetter__(name, function(value) {
              for (var i = 0; i < self.length; i++) {
                var record = self[i]
                record[name] = value
              }
            })
          }
        })(name, pseudo[name])
      }

      return pseudo
    })
  }
}
