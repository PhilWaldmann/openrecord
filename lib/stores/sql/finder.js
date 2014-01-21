var Knex  = require('knex');
var Utils = require('../../utils');

/*
 * MODEL
 */
exports.model = {
  find: function(){
    var args = Utils.args(arguments);
    var primary_keys = this.definition.primary_keys;
    
    var where = {};
    var callback;
    var find_one = true;
    
    if(typeof args[args.length -1] == 'function'){
      callback = args.pop();      
    }
    
    if(args.length == primary_keys.length){
      for(var i = 0; i < primary_keys.length; i++){
        where[primary_keys[i]] = args[i];
        
        if(args[i] instanceof Array){
          find_one = false;
        }
      }
      args = [where];
    }
    
    
    
    if(callback){
      args.push(callback);
    }
    
    var self = this.where.apply(this, args);
    
    if(find_one) self.limit(1);
    
    return self;
  },
  
  
  
  
  where: function(){
    var self = this.chain();
    var args = Utils.args(arguments);
    
    var callback;
    
    if(typeof args[args.length -1] == 'function'){
      callback = args.pop();      
    }
        
    self.addInternal('conditions', args)
    
    
    if(callback){
      self.exec(callback);
    }
    
    return self;
  },
  
  
  limit: function(limit, offset){
    var self = this.chain();
    
    self.setInternal('limit', limit);
    self.setInternal('offset', offset);
    
    return self;
  },
  
  
  exec: function(callback){
    var query = this.query;
    var conditions = this.getInternal('conditions');
    
    for(var i in conditions){
      this._addCondition(conditions[i]);
    }
    
    console.log(query.toString());
    
    query.exec(function(err, resp) { 
      //console.log('QUERY', err, resp);
      callback(resp);
    });
    
    return this;
  },
  
  
  
  _addCondition: function(conditions){
    var self = this;

    // Not very nice...
    var comparisons = {
      not: '!=',
      gt: '>',
      gte: '=>',
      lt: '<',
      lte: '=<',
      like: 'like',
      not_like: 'not like',
      between: 'between',
      ilike: 'ilike'   
    };

    if(typeof conditions[0] == 'string'){
      var condition = conditions.shift();      
      var args = conditions;
      
      if(args.length == 1 && typeof args[0] == 'object' && !(args[0] instanceof Array)){
        var values = args[0];
        var tmp = [];
        
        args = [];
        
        condition = condition.replace(/\:(.+)/, function(result, field){
          args.push(values[field]);
          return '?'
        }); 
      }
      
      this.query.whereRaw(condition, args);
    }else{
      for(var i in conditions){
        var condition = conditions[i];
        
        if(condition instanceof Array){
          return this._addCondition(condition);
        }
        
        if(typeof condition == 'object'){
          for(var name in condition){
            var match;
            var value = condition[name];
            var regexp = new RegExp('(.+?)(_(' + Object.keys(comparisons).join('|') + ')|)$', 'i');
            var tmp = name.match(regexp);
            var comparison = comparisons[tmp[3]] || '=';          
            name = tmp[1];
                
            if(value instanceof Array){
              if(comparison == '!='){
                this.query.whereNotIn(name, self.definition.cast(name, value));
              }else{
                this.query.whereIn(name, self.definition.cast(name, value));
              }              
            }else{
              this.query.where(name, comparison, self.definition.cast(name, value));
            }
            
          }
        }
        
      }
    } 
  }
};
