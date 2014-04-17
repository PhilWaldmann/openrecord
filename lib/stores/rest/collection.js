/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){          
    this.afterFind(function(data){
    
      var records = data.result;

      if(!(records instanceof Array)){
        records = records[this.root || 'data'] || [];
      }

      for(var i in records){
        records[i] = this.new(records[i]);
        records[i]._exists();
      }
      data.result = this;
          
      return true;
    }, 100);
    
  }
};