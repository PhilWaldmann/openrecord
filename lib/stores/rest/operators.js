
/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
    this.addOperator('eq', function(attr, value, options, cond){
      options.params[attr] = value
    }, {
      default: true,
      nullify_empty_array: true
    })


    this.attributeTypes[String].operators = {
      default: 'eq',
      'eq': this.operator_types['eq']
    }

    this.attributeTypes[Number].operators = {
      default: 'eq',
      'eq': this.operator_types['eq']
    }

    this.attributeTypes[Date].operators = {
      default: 'eq',
      'eq': this.operator_types['eq']
    }

    this.attributeTypes[Boolean].operators = {
      default: 'eq',
      'eq': this.operator_types['eq']
    }
  }
}
