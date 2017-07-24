const parse = require('date-fns/parse')

exports.store = {

  mixinCallback: function(){
    this.addType('datetime', function(value){
      if(value === null) return null
      return parse(value)
    }, {
      migration: 'datetime',
      operators: {
        defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
      }
    })
  }
}
