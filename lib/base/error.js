var Error = function(){
  
};

Error.prototype.add = function(name, message){
  if(message == null){
    message = name;
    name = 'base';
  }
  
  if(name == 'add') throw new Error("'add' is reservated");
  
  this[name] = this[name] || [];
  this[name].push(message);
};

/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(){
    this.errors = new Error();
  }
};
