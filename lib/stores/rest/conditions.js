var Helper = require('./helper');
var Utils = require('../../utils');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
    this.beforeFind(function(options){
      var conditions = this.getInternal('conditions') || [];
      var primary_keys = self.primary_keys;

      Helper.applyConditions(conditions, options, primary_keys);
      
      return true;
    }, -70);
    
  }
};


exports.model = {
  find: function(){
    var self = this.callParent.apply(this, Utils.args(arguments));
    if(this.getInternal('limit') === 1){
      self.setInternal('action', 'show');
    }    
    return self;
  }
}