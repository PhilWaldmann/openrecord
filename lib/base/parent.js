exports.store = exports.definition = exports.model = exports.record = exports.utils = {
  callParent: function callParent(){
    var Utils = this // utils itself
    if(this.utils) Utils = this.utils // store
    if(this.store) Utils = this.store.utils // definition
    if(this.definition) Utils = this.definition.store.utils // record, model

    var parentFn = callParent.caller._parent
    if(typeof parentFn === 'function' && callParent.caller !== parentFn){
      return parentFn.apply(this, Utils.args(arguments))
    }
  }
}
