var Utils = require('../../../utils');

exports.store = {

  mixinCallback: function(){
      
    
    //EQUAL OPERATOR (=, is null)
    this.addOperator('eq', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '=', value);
    },{
      default: true,
      nullify_empty_array: true,
      on: {
        'array': function(attr, value, query, cond){
          query.whereIn(Utils.getAttributeName(this, cond), value);  
        },
        
        'null': function(attr, value, query, cond){
          query.whereNull(Utils.getAttributeName(this, cond));
        },
        
        'attribute': function(attr, value, query, cond){ //TODO: same for other operators?!
          query.whereRaw(Utils.getAttributeName(this, cond, true) + ' = ' + Utils.getAttributeName(this, value, true));
        }
      }
    });
    
    
    
    //NOT OPERATOR (!=, is not null)
    this.addOperator('not', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '!=', value);
    },{
      nullify_empty_array: true,
      on: {
        'array': function(attr, value, query, cond){
          query.whereNotIn(Utils.getAttributeName(this, cond), value);  
        },
        
        'null': function(attr, value, query, cond){
          query.whereNotNull(Utils.getAttributeName(this, cond));
        }
      }
    });
        
    
    
    //GREATER THAN OPERATOR (>)
    this.addOperator('gt', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '>', value);
    },{
      on:{
        'array': false //TODO: multiple orWhere() ??
      }
    });
    
    //GREATER THAN EQUAL OPERATOR (>=)
    this.addOperator('gte', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '>=', value);
    },{
      on:{
        'array': false //TODO: multiple orWhere() ??
      }
    });
    
    //LOWER THAN OPERATOR (<)
    this.addOperator('lt', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '<', value);
    },{
      on:{
        'array': false //TODO: multiple orWhere() ??
      }
    });
    
    //LOWER THAN EQUAL OPERATOR (<=)
    this.addOperator('lte', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), '<=', value);
    },{
      on:{
        'array': false //TODO: multiple orWhere() ??
      }
    });
    
    
    
    
    //BETWEEN OPERATOR (between)
    this.addOperator('between', function(attr, values, query, cond){
      if(values[0] instanceof Array){
        var self = this;
        query.where(function(){
          for(var i = 0; i < values.length; i++){
            this.orWhereBetween(Utils.getAttributeName(self, cond), values[i]);
          }
        });
      }else{
        query.whereBetween(Utils.getAttributeName(this, cond), values);
      }      
    },{
      on:{
        'all': false,
        'array': true
      }
    });
    
    
    //LIKE OPERATOR (like)
    this.addOperator('like', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), 'like', '%' + value + '%');      
    },{
      on:{
        'all': false,
        'string': true,
        'array': function(attr, values, query, cond){
          var self = this;
          query.where(function(){
            for(var i = 0; i < values.length; i++){
              this.orWhere(Utils.getAttributeName(self, cond), 'like', '%' + values[i] + '%');
            }
          });
        }
      }
    });
    
    
    
    //iLIKE OPERATOR (ilike)
    this.addOperator('ilike', function(attr, value, query, cond){
      query.where(Utils.getAttributeName(this, cond), 'ilike', '%' + value + '%');      
    },{
      on:{
        'all': false,
        'string': true,
        'array': function(attr, values, query, cond){
          var self = this;
          query.where(function(){
            for(var i = 0; i < values.length; i++){
              this.orWhere(Utils.getAttributeName(self, cond), 'ilike', '%' + values[i] + '%');
            }
          });
        }
      }
    });
    
  }
  
}