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
  }
  
};




var OPERATORS = {
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


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;    
    this.beforeFind(function(query){
      var conditions = this.getInternal('conditions');
  
      for(var i in conditions){
        self.conditionsParse(this.query, conditions[i]);
      }
      
      return true;
    });
  },
  
  
  conditionsParse: function(query, conditions){
    if(typeof conditions[0] == 'string'){
      this.conditionArrayParse(query, conditions.shift(), conditions)
    }else{
      for(var i in conditions){
        this.conditionHashParse(query, conditions[i]);
      }
    }
  },
  
  
  //if we use something like ["login = ?", "phil"]
  conditionArrayParse: function(query, condition, args){      
    if(args.length == 1 && typeof args[0] == 'object' && !(args[0] instanceof Array)){
      
      //if we use ["login = :login", {login:"phil"}]
      var values = args[0];
      var tmp = [];        
      args = [];        
      condition = condition.replace(/\:(.+)/, function(result, field){
        args.push(values[field]);
        return '?'
      }); 
    }
  
    query.whereRaw(condition, args);
  },
  
  
  conditionHashParse: function(query, condition){
    if(condition instanceof Array){
      return this.conditionsParse(query, condition);
    }
  
    //if we use {login:'phil'} or {login_like:'phil'}
    if(typeof condition == 'object'){
      for(var name in condition){
        var value = condition[name];
        var regexp = new RegExp('(.+?)(_(' + Object.keys(OPERATORS).join('|') + ')|)$', 'i');
        var tmp = name.match(regexp);
        var comparison = OPERATORS[tmp[3]] || '=';          
        name = tmp[1];
          
        if(value instanceof Array){
          if(comparison == '!='){
            query.whereNotIn(name, this.cast(name, value));
          }else{
            query.whereIn(name, this.cast(name, value));
          }              
        }else{
          query.where(name, comparison, this.cast(name, value));
        }
      
      }
    }
  }
  
  
}