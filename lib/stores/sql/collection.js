
/*
 * MODEL
 */
exports.model = {
  create: function(data, fn){
    this.new(data).save(fn);
    return this;
  },
  
  
  asJson: function(){
    var self = this.chain();
    
    self.setInternal('as_json', true);
  
    return self;
  }
};



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){          
    this.afterFind(function(data){
    
      var as_json = this.getInternal('as_json');
      var records = data.result;

      if(as_json !== true){
        for(var i in records){
          records[i].__exists = true;
          records[i] = this.new(records[i]);
        }
        data.records = this;
      }
            
      return true;
    }, 55);
    
  }
};