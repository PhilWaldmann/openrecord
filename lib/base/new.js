/*
 * MODEL
 */
exports.model = {
  'new': function(data){
    if(this.chained){
      var record = new this.model(data);
      this.add(record);
      return record;
    }
    
    return new this(data); 
  }
};