var async = require('async');
var Utils = require('../../utils');

/*
 * MODEL
 */
exports.model = {
  
  /**
   * Specify SQL group fields.
   * @class Model
   * @method group
   * @param {array} fields - The field names
   *
   *
   * @return {Model}
   */
  group: function(){
    var self = this.chain();

    var args = Utils.args(arguments);
    var fields = []
    fields = fields.concat.apply(fields, args); //flatten
    
    self.addInternal('group', fields);
    self.asRaw();
    
    return self;
  },
  
  
  /**
   * SQL Having conditions
   * @class Model
   * @method having
   * @param {object} conditions - every key-value pair will be translated into a condition
   * @or
   * @param {array} conditions - The first element must be a condition string with optional placeholder (?), the following params will replace this placeholders
   *
   * @return {Model}
   */
  having: function(){
    var self = this.chain();
    var args = Utils.args(arguments);
         
    var conditions = Utils.sanitizeConditions(this, args);
    
    self.addInternal('having', conditions);
            
    return self;
  }
};


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;  

    this.beforeFind(function(query, next){
      var group = this.getInternal('group');
      var select = this.getInternal('select');  
      var having = this.getInternal('having');
      var table_map = this.getInternal('table_map');
                  
      if(group){
        if(!select){
          this.select(group);
        }        
        
        for(var i = 0; i < group.length; i++){
          var tmp = group[i];
          
          //check for function calls => don't escape them!
          if(tmp.match(/(\(|\))/)){
            tmp = self.store.connection.raw(tmp);
          }
                  
          query.groupBy.call(query, tmp);          
        }
        
        this.asJson();
                
                
        if(having){
          var calls = [];
          var chain = this;
      
          for(var i = 0; i < having.length; i++){
            if(!having[i]) continue;
        
            (function(having){
              calls.push(function(done){
                
                query.having(function(){
                  var emptyfn = function(){};
                  if(having.type === 'hash'){
                    chain.callInterceptors('onHashCondition', [chain, having, this], emptyfn);
                  }else{
                    chain.callInterceptors('onRawCondition', [chain, having, this], emptyfn);
                  }
                });    
                            
                done();
              });          
            })(having[i]);
          }
    
    
          if(calls.length > 0){
            return async.parallel(calls, function(err){
              next(err);
            });
          }
        }
      }
         
      next();
    }, -45);        
  }
};