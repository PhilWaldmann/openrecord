var Utils = require('../utils');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.default_scopes = [];
  },
  
  
  /**
   * Creates a custom chained Model method
   *
   * @class Definition
   * @method scope
   * @param {string} name - The name of the scope
   * @param {function} callback - The scope function
   *
   * @callback
   * @param {..custom..} You could define your own params.
   * @this Model
   *
   * @return {Definition}
   */
  scope: function(name, fn){
      
    var tmp = function(){
      var args = Utils.args(arguments);
      var self = this.chain();

      fn.apply(self, args);
      
      return self;
    }

    this.staticMethods[name] = tmp;
    
    return this;
  },
  
  
  
  /**
   * Adds a default scope
   *
   * @class Definition
   * @method defaultScope
   * @param {string} name - The name of the scope
   *
   * @return {Definition}
   */
  defaultScope: function(name){
    this.default_scopes.push(name);
    return this;
  }
};


exports.model = {
  callDefaultScopes: function(){
    var called_scopes = []
    
    if(this.chained){
      called_scopes = this.getInternal('called_scopes') || [];
    }
        
    for(var i = 0; i < this.definition.default_scopes.length; i++){
      var scope = this.definition.default_scopes[i];
      
      if(typeof this[scope] === 'function' && called_scopes.indexOf(scope) === -1){
        this[scope].call(this);
        called_scopes.push(scope);
      }
    }
        
    if(this.chained){
      this.setInternal('called_scopes', called_scopes);
    }    
    
    return this;
  }
}