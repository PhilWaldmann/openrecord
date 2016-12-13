var util = require('util');


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.afterFind(function(data){
      var records = data.result;

      if(!util.isArray(records)){
        records = records[this.rootParam || 'data'] || [];
      }

      if(records && !util.isArray(records)){
        records = [records]; //Every result is an array...
      }

      data.result = records;

      return true;
    }, 100);

  }
};
