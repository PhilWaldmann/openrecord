exports.store = exports.definition = exports.model = exports.record = {
  parent: function parent(){
    var parentfn = parent.caller.parent;
    
    if(typeof parentfn === 'function'){
      return parentfn.apply(this, arguments);
    }
  }
}