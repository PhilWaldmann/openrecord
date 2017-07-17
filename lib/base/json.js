var Utils = require('../utils')

exports.record = {
  /**
   * Returns an object which represent the record in plain json
   *
   * @class Record
   * @method toJson
   * @param {array} allowedAttributes - Optional: Only export the given attributes and/or relations
   * @param {object} exportObject - Optional: By default, OpenRecord clones the `attributes` object. If you specify the `exportObject` it will this instead.
   *
   * @return {object}
   */
  toJson: function(allowedAttributes, exportObject){
    var tmp = exportObject || Utils.clone(this.attributes)
    var definition = this.definition

    for(var i in definition.relations){
      var relation = definition.relations[i]
      if(this.relations && this.relations[relation.name]){
        tmp[relation.name] = this.relations[relation.name].toJson()
      }
    }

    if(!allowedAttributes && this.allowedAttributes) allowedAttributes = this.allowedAttributes

    for(var name in tmp){
      if(allowedAttributes && allowedAttributes.indexOf(name) === -1){
        delete tmp[name]
      }else{
        if(definition.attributes && definition.attributes[name] && definition.attributes[name].hidden !== true){
          tmp[name] = definition.attributes[name].type.cast.output.call(this, tmp[name])
        }
      }
    }

    return tmp
  },

  // used by JSON.stringify
  toJSON: function(){
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
  toJson: function(allowedAttributes){
    var tmp = []
    this.each(function(record){
      tmp.push(record.toJson(allowedAttributes))
    })
    return tmp
  },

  // used by JSON.stringify
  toJSON: function(){
    return this.toJson()
  }
}
