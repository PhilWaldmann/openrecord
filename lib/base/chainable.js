var Utils = require('../utils');
var Store = require('../store');


exports.definition = {
  mixinCallback: function(){
    var self = this;
    self.chainGenerator = null;
    
    this.on('finished', function(){
    
    
      var Chain = function(){};      
      Chain.prototype = new Array;
      
      
      var ChainModelMethods = {
        setInternal: function(name, value){
          this._internal_attributes[name] = value;
        },
      
        getInternal: function(name){
          return this._internal_attributes[name];
        },
      
        addInternal: function(name, value){
          this._internal_attributes[name] = this._internal_attributes[name] || [];
          if(value instanceof Array){
            this._internal_attributes[name] = this._internal_attributes[name].concat(value);
          }else{
            this._internal_attributes[name].push(value);
          }        
        },
      
        definition: self,
        model: self.model,
        chained: true
      };
    
      var store_type = self.store.type;
      Utils.mixin(Chain.prototype, ChainModelMethods, {enumerable: false});
      Utils.mixin(Chain.prototype, self.model, {enumerable: false});
      Utils.mixin(Chain.prototype, Store.registeredTypes[store_type], {only:'chain', enumerable: false});
            
      self.chainGenerator = function(options){
        var arr = [];
        arr.__proto__ = Chain.prototype;
        arr.options = options || {};
        arr._internal_attributes = {};
        
        Utils.mixinCallbacks(arr);
        
        return arr;      
      };
      
    });    
  }
}

/*
 * MODEL
 */
exports.model = {
  /**
   * Returns a Collection, which is in fact a cloned Model - or a chained Model
   * A Collectioin is an Array with all of Models' methods. All `where`, `limit`, `setContext`, ... information will be stored in this chained Model to allow asynchronous usage.
   * 
   * @section Model
   * @method chain
   *
   * @return {Collection}
   */ 
  chain: function(options){
    if(this.chained) return this;
            
    var ChainModel = new this.definition.chainGenerator(options);

    return ChainModel;
  }
};