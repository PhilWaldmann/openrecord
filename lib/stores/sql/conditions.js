var util = require('util');


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
   
    this.onRawCondition(function(chain, condition, query){
      
      for(var i = 0; i < condition.args.length; i++){
        //Hacky fix for a knex problem!
        if(util.isArray(condition.args[i])){
          var len = condition.args[i].length;
          condition.args.splice.apply(condition.args, [i, 1].concat(condition.args[i]));
          
          var index = 0;
          condition.query = condition.query.replace(/\?/g, function(){
            if(index === i){
              var tmp = [];
              for(var k = 0; k < len; k++){
                tmp.push('?');
              }

              return tmp.join(',');
            }
            index++;
            return '?';
          });
          
          i += len;
          
        }
      }
      
      query.whereRaw(condition.query, condition.args);
      
    });
    
  }  
  
};