var util = require('util');
var Utils = require('../utils');
var Store = require('../store');


exports.definition = {
  mixinCallback: function(){
    var self = this;
    self.chainGenerator = null;

    this.on('finished', function(){


      var Chain = function(){};
      Chain.prototype = new Array;

      // Array.find() interference with out own find method - when called via callParent()
      // so, the current solution is to null it!
      Chain.prototype.find = null

      var ChainModelMethods = {
        setInternal: function(name, value){
          this._internal_attributes[name] = value;
        },

        getInternal: function(name){
          return this._internal_attributes[name];
        },

        clearInternal: function(name){
          this._internal_attributes[name] = null;
        },

        addInternal: function(name, value){
          this._internal_attributes[name] = this._internal_attributes[name] || [];
          if(util.isArray(value)){
            this._internal_attributes[name] = this._internal_attributes[name].concat(value);
          }else{
            this._internal_attributes[name].push(value);
          }
        },

        definition: self,
        model: self.model,
        chained: true
      };


      Utils.mixin(Chain.prototype, ChainModelMethods, {enumerable: false});
      Utils.mixin(Chain.prototype, self.model, {enumerable: false});
      Utils.mixin(Chain.prototype, self.store.mixinPaths, {only:'chain', enumerable: false});

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
   * @class Model
   * @method chain
   * @param {object} options - The options hash
   *
   * @options
   * @param {boolean} clone - Clone a existing chained object. Default: false
   *
   * @return {Collection}
   */
  chain: function(options){
    options = options || {};
    if(this.chained && options.clone !== true) return this;

    var ChainModel = new this.definition.chainGenerator(options);

    if(this.chained && options.clone === true){
      ChainModel._internal_attributes = Utils.clone(this._internal_attributes);
    }

    return ChainModel.callDefaultScopes();
  },


  /**
   * Returns a cloned Collection
   *
   * @class Model
   * @method clone
   *
   * @return {Collection}
   */
  clone: function(){
    return this.chain({clone: true});
  }
};
