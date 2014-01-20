/*
 * MODEL
 */
exports.model = {
  create: function(data, fn){
    var tmp = new this(data); 
    //tmp.save(fn);
    this.definition.emit(tmp, 'create'); //TODO: put in Model constructor!
  }
};