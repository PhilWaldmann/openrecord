var Utils = require('../utils');

exports.record = {
  /**
   * Returns an object which represent the record in plain json
   * 
   * @section Record
   * @method toJson
   * @param {array} allowed_attributes - Optional: Only export the given attributes and/or relations
   *
   * @return {object}
   */ 
  toJson: function(allowed_attributes){
    var tmp = Utils.clone(this.attributes);
    
    for(var i in this.model.definition.relations){
      var relation = this.model.definition.relations[i];
      if(this[relation.name]){
        tmp[relation.name] = this[relation.name].toJson();
      }      
    }
    
    if(!allowed_attributes && this.allowed_attributes) allowed_attributes = this.allowed_attributes;
    
    if(allowed_attributes && allowed_attributes.length > 0){
      for(var name in tmp){
        if(allowed_attributes.indexOf(name) === -1){
          delete tmp[name];
        }
      }
    }
    
    return tmp;
  }
};


exports.chain = {
  /**
   * Returns an array of objects which represent the records in plain json
   * 
   * @section Collection
   * @method toJson
   * @param {array} allowed_attributes - Optional: Only export the given attributes and/or relations
   *
   * @return {array}
   */ 
  toJson: function(allowed_attributes){
    var tmp = [];
    this.each(function(record){
      tmp.push(record.toJson(allowed_attributes));
    });
    return tmp;
  }
};
