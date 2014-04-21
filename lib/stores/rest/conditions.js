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
    var self = this.parent.apply(this, Utils.args(arguments));
    self.setInternal('action', 'show');
    return self;
  }
}