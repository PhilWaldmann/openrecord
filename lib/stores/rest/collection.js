/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){          
    this.afterFind(function(data){    
      var records = data.result;

      if(!(records instanceof Array)){
        records = records[this.rootParam || 'data'] || [];
      }
      
      if(records && !(records instanceof Array)){
        records = [records]; //Every result is an array...
      }
      
      data.result = records;
          
      return true;
    }, 100);
    
  }
};