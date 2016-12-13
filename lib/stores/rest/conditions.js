var Helper = require('./helper');
var Utils = require('../../utils');


exports.model = {
  find: function(){
    var self = this.callParent.apply(this, Utils.args(arguments));
    self.setInternal('action', 'show');
    return self;
  }
}
