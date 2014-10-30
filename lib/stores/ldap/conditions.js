var Helper = require('./helper');
var Utils = require('../../utils');


exports.store = {
  mixinCallback: function(){
    this.likePlaceholder = '*';
  }
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
    this.beforeFind(function(options){
      var conditions = this.getInternal('conditions') || [];

      Helper.applyConditions(conditions, options);
      
      return true;
    }, -70);
    
  }
};