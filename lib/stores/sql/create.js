/*
 * MODEL
 */
exports.model = {
  create: function(data, fn){
    this.new(data).save(fn);
    return this;
  }
};