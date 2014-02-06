/*
 * MODEL
 */
exports.model = {
  'new': function(data){
    if(this.chained){
      data = data || {};
            
      var record = this.model.new(data);
      record.__chained_model = this;
      
      this.add(record);
      
      return record;
    }
        
    return new this(data); 
  }
};


/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config){
    var chained_model = config ? config.__chained_model : null;
    
    if(this.model.chained){
      chained_model = this;
    }
    
    Object.defineProperty(this, '__chained_model', {enumerable: false, writable: true, value: chained_model});
  } 
};



/*
 * CHAIN
 */
exports.chain = {
    
  each: function(callback){
    for(var i = 0; i < this.length; i++){
      callback(i, this[i]);
    }
    return this;
  },
  
  
  add: function(records){
    var self = this.chain();
    
    if(!(records instanceof Array)) records = [records];    
    
    for(var i = 0; i < records.length; i++){
      var record = records[i];
      if(typeof record == 'object'){
        if(!(record instanceof self.model)) record = self.model.new(record);        
        self.push(record);
      }
    }    
    
    return self;
  },
  
  
  remove: function(index){
    var self = this.chain();
    
    if(typeof index != 'number'){
      index = self.indexOf(index);
    }

    self.splice(index, 1);
    
    return self;
  },
  
  
  
  first: function(){
    return this[0];
  },
  
  
  last: function(){
    return this[this.length - 1];
  }
};