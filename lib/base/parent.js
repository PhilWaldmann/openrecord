var Utils = require('../utils')

exports.store = exports.definition = exports.model = exports.record = {
  callParent: function callParent(){
    var parentFn = callParent.caller._parent
    if(typeof parentFn === 'function' && callParent.caller !== parentFn){
      return parentFn.apply(this, Utils.args(arguments))
    }
  }
}
