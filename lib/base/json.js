var Utils = require('../utils');

exports.record = {
  /**
   * Returns an object which represent the record in plain json
   * 
   * @class Record
   * @method toJson
   * @param {array} allowed_attributes - Optional: Only export the given attributes and/or relations
   * @param {object} export_object - Optional: By default, OpenRecord clones the `attributes` object. If you specify the `export_object` it will this instead.
   *
   * @return {object}
   */ 
  toJson: function(allowed_attributes, export_object){
    var tmp = export_object || Utils.clone(this.attributes);
    var definition = this.definition;
    
    for(var i in definition.relations){
      var relation = definition.relations[i];
      if(this.relations[relation.name]){
        tmp[relation.name] = this.relations[relation.name].toJson();
      }      
    }
    
    if(!allowed_attributes && this.allowed_attributes) allowed_attributes = this.allowed_attributes;
    
    for(var name in tmp){

      if(allowed_attributes && allowed_attributes.indexOf(name) === -1){
        delete tmp[name];
      }else{
        if(definition.attributes[name]){
          tmp[name] = definition.attributes[name].type.cast.output.call(this, tmp[name]);
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
   * @class Collection
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
