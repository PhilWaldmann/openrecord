var validator = require('validator');

/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
    this.operator_types = {};
    this.operator_default = null;
  },



  //register global operators - could be overwritten per data type
  addOperator: function(name, fn, options){
    options = options || {};

    if(!name) throw new Error('No name given');
    if(!fn) throw new Error('No valid method given');

    if(typeof name == 'string') name = name.toLowerCase();

    options.name = name;
    options.method = fn;

    this.operator_types[name] = options;
    if(options.default) this.operator_default = name
  },


  getOperator: function(name){
    if(typeof name == 'string') name = name.toLowerCase();
    return this.operator_types[name] || this.operator_types[this.operator_default];
  }
};
