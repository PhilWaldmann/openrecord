var validator = require('validator');

/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){

    this.addOperator('eq', function(attr, value, options, cond){
      options.params[attr] = value;
    },{
      default: true,
      nullify_empty_array: true
    });


    this.attribute_types[String].operators = {
      default: 'eq',
      'eq': this.operator_types['eq']
    };

    this.attribute_types[Number].operators = {
      default: 'eq',
      'eq': this.operator_types['eq']
    };

    this.attribute_types[Date].operators = {
      default: 'eq',
      'eq': this.operator_types['eq']
    };

    this.attribute_types[Boolean].operators = {
      default: 'eq',
      'eq': this.operator_types['eq']
    };

  }
};
