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
      var where = conditions[i];
      
      for(var i = 0; i < where.length; i++){
        var condition = where[i];
        
        switch(typeof condition){
          case 'string':
            console.log('WHERE s', condition);
            query = query.where.apply(query, condition);
          break;
          case 'object':
            //if(condition...)
            console.log('WHERE o', condition);
            //query = query.where.apply(query, condition);
          break;
        }
      }
    }
    
    console.log(query.toString());
    
    query.exec(function(err, resp) { 
      console.log('QUERY', err, resp);
      callback(resp);
    });
    
    return this;
  }
};