/*
 * STORE
 */
exports.store = {
  mixinCallback: function() {
    this.addOperator(
      'eq',
      function(attr, value, options, cond) {
        options.params[attr] = value
      },
      {
        default: true,
        nullifyEmptyArray: true
      }
    )

    this.attributeTypes[String].operators = {
      default: 'eq',
      eq: this.operatorTypes['eq']
    }

    this.attributeTypes[Number].operators = {
      default: 'eq',
      eq: this.operatorTypes['eq']
    }

    this.attributeTypes[Date].operators = {
      default: 'eq',
      eq: this.operatorTypes['eq']
    }

    this.attributeTypes[Boolean].operators = {
      default: 'eq',
      eq: this.operatorTypes['eq']
    }
  }
}
