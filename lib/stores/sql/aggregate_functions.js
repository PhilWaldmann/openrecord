/*
 * MODEL
 */
exports.model = {
  count: function(field){
    var self = this.chain();  
    self.setInternal('count', field);  
    return self;
  },
  
  
  sum: function(field){
    var self = this.chain();  
    self.setInternal('sum', field);  
    return self;
  },
  
  
  max: function(field){
    var self = this.chain();  
    self.setInternal('max', field);  
    return self;
  },
  
  
  min: function(field){
    var self = this.chain();  
    self.setInternal('min', field);  
    return self;
  }
};



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;    
    
    this.beforeFind(function(query){
      var count = this.getInternal('count');
      var sum = this.getInternal('sum');
      var min = this.getInternal('min');
      var max = this.getInternal('max');
      
      if(count){
        query.count(count);
      }
      
      if(sum){
        query.sum(sum);
      } 
      
      if(min){
        query.min(min);
      } 
      
      if(max){
        query.max(max);
      }     
      
      return true;
    });
    
  }
};