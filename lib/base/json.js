exports.record = {
  /**
   * Returns an object which represent the record in plain json
   *
   * @class Record
   * @method toJson
   * @param {array} allowedAttributes - Optional: Only export the given attributes and/or relations
   * @param {object} exportObject - Optional: By default, OpenRecord clones the `attributes` object. If you specify the `exportObject` it will use this instead.
   *
   * @return {object}
   */
  toJson: function(allowedAttributes, exportObject) {
    var definition = this.definition
    var tmp = exportObject || definition.store.utils.clone(this.attributes)

    for (var i in definition.relations) {
      var relation = definition.relations[i]
      if (this['_' + relation.name]) {
        tmp[relation.name] = this['_' + relation.name]
        if (typeof tmp[relation.name].toJson === 'function')
          tmp[relation.name] = tmp[relation.name].toJson()
      }
    }

    if (!allowedAttributes && this.allowedAttributes)
      allowedAttributes = this.allowedAttributes

    for (var name in tmp) {
      if (allowedAttributes && allowedAttributes.indexOf(name) === -1) {
        delete tmp[name]
      } else {
        if (
          definition.attributes &&
          definition.attributes[name] &&
          definition.attributes[name].hidden !== true
        ) {
          tmp[name] = definition.cast(name, tmp[name], 'output', this)

          if (tmp[name] && typeof tmp[name].toJson === 'function'){
            tmp[name] = tmp[name].toJson()
          }

          // convert to external names
          var value = tmp[name]
          delete tmp[name]
          tmp[definition.attributes[name].name] = value
        }
      }
    }

    return tmp
  },

  // used by JSON.stringify
  toJSON: function() {
    return this.toJson()
  }
}

exports.chain = {
  /**
   * Returns an array of objects which represent the records in plain json
   *
   * @class Collection
   * @method toJson
   * @param {array} allowedAttributes - Optional: Only export the given attributes and/or relations
   *
   * @return {array}
   */
  toJson: function(allowedAttributes) {
    var tmp = []
    this.forEach(function(record) {
      tmp.push(record.toJson(allowedAttributes))
    })
    return tmp
  },

  // used by JSON.stringify
  toJSON: function() {
    return this.toJson()
  }
}
