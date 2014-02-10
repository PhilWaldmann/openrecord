var Utils = require('../utils');

exports.record = {
  /**
   * Returns an object which represent the record in plain json
   * 
   * @area Record
   * @method toJson
   *
   * @return {object}
   */ 
  toJson: function(){
    var tmp = Utils.clone(this.attributes);
    
    for(var i in this.model.definition.relations){
      var relation = this.model.definition.relations[i];
      if(this[relation.name]){
        tmp[relation.name] = this[relation.name].toJson();
      }      
    }
    
    return tmp;
  }
};


exports.chain = {
  /**
   * Returns an array of objects which represent the records in plain json
   * 
   * @area Collection
   * @method toJson
   *
   * @return {array}
   */ 
  toJson: function(){
    var tmp = [];
    this.each(function(record){
      tmp.push(record.toJson());
    });
    return tmp;
  }
};
