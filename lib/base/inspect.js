/*
 * MODEL
 */
exports.model = {
  _inspect: function(){
    var methods = [];
  
    for(var name in this){
      if(this.hasOwnProperty(name) && name != 'inspect'){
        if(typeof this[name] == 'function'){
          methods.push(name + '()');
        }
      }
    }
  
    return this.model + ': ' + methods.join(' ');
  }
};