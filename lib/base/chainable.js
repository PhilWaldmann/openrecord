var Utils = require('../utils');
var Store = require('../store');

/*
 * MODEL
 */
exports.model = {
  chain: function(){
    if(this.chained) return this;
    
  
    var Model = this;
    var internal_attributes = {};
    
    var ChainModel = [];
    
    var ChainModelMethods = {
      setInternal: function(name, value){
        internal_attributes[name] = value;
      },
      
      getInternal: function(name){
        return internal_attributes[name];
      },
      
      addInternal: function(name, value){
        internal_attributes[name] = internal_attributes[name] || [];
        internal_attributes[name].push(value);
      },
      
      definition: Model.definition,
      model: this,
      chained: true
    }
        
  
    var store_type = this.definition.store.type;
  
    Utils.mixin(ChainModel, Model, {enumerable: false});
    Utils.mixin(ChainModel, ChainModelMethods, {enumerable: false});
    Utils.mixin(ChainModel, Store.registeredTypes[store_type], {only:'chain', enumerable: false});
        
    ChainModel.prototype = Model.prototype;
  
    Utils.mixinCallbacks(ChainModel);
  
    return ChainModel;
  }
};