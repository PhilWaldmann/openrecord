/*
 * MODEL
 */
exports.model = {
  'new': function(data){
    if(this.chained){
      var record = this.model.new(data);
      this.add(record);
      return record;
    }
        
    return new this(data); 
  }
};