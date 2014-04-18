exports.store = exports.definition = exports.model = exports.record = {
  parent: function parent(){
    var parentfn = parent.caller._parent;
    if(typeof parentfn === 'function' && parent.caller != parentfn){
      return parentfn.apply(this, arguments);
    }
  }
}