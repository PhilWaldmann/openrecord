var Utils = require('../utils');

exports.store = exports.definition = exports.model = exports.record = {
  callParent: function callParent(){
    var parentfn = callParent.caller._parent;
    if(typeof parentfn === 'function' && callParent.caller != parentfn){
      return parentfn.apply(this, Utils.args(arguments));
    }
  }
}