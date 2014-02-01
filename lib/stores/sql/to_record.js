/*
 * MODEL
 */
exports.chain = {
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
        if(records instanceof Array){          
          for(var i in records){
            records[i] = this.new(records[i]);
          }          
        }else{
          data.result = this.new(records);
        }
      }
            
      return true;
    }, 55);
    
  }
};