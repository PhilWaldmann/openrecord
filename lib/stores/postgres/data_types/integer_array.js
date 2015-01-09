var Utils = require('../../../utils');

exports.store = {

  mixinCallback: function(){
    
    this.addType('integer_array', this.toArrayCastTypes('integer'), {
      migration:{
        integerArray: 'integer[]'
      },
      
      operators:{
        default: 'in',
        'in': {
          method: function(attr, value, query, cond){
            query.whereRaw(Utils.getAttributeName(this, cond) + " @> ARRAY[?]::integer[]", [value]);
          },
          
          nullify_empty_array: true,
          on: {
            'all': false,
            'number': true,
            'array': function(attr, value, query, cond){
              query.whereRaw(Utils.getAttributeName(this, cond) + " && ?::integer[]", [value]);
            },
            'attribute': function(attr, value, query, cond){
              query.whereRaw(Utils.getAttributeName(this, cond) + " @> ARRAY[" + Utils.getAttributeName(this, value, true) + "]::integer[]");
            }
          }
        }
      }
    });    
        
  }
};
