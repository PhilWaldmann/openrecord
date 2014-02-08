/*
 * MODEL
 */
exports.model = {
  /**
   * Initialize a new Record.
   * You could either use 
   * ```js
   * var records = new Model();
   * ```
   * or
   * ```js
   * var records = Model.new();
   * ```
   * 
   * @area Model
   * @method new
   * @param {object} attributes - Optional: The records attributes
   *
   * @return {Record}
   */ 
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
    
  /**
   * Loops all the Records in the Collection
   * 
   * @area Collection
   * @method each
   * @param {function} callback - The method to be called for every record
   *
   * @callback
   * @param {Record} record - The current record
   * @scope Collection
   *
   * @return {Collection}
   */ 
  each: function(callback){
    for(var i = 0; i < this.length; i++){
      if(callback.length == 1){
        callback.call(this, this[i]);
      }else{
        callback.call(this, i, this[i]);
      }      
    }
    return this;
  },
  
  /**
   * Adds new Records to the collection
   * 
   * @area Collection
   * @method add
   * @param {array} Record - Either a object which will be transformed into a new Record, or an existing Record
   *
   * @return {Collection}
   */ 
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
  
  /**
   * Removes a Record from the Collection
   * 
   * @area Collection
   * @method remove
   * @param {integer} index - Removes the Record on the given index
   * @param OR
   * @param {Record} record - Removes given Record from the Collection
   *
   * @return {Collection}
   */ 
  remove: function(index){
    var self = this.chain();
    
    if(typeof index != 'number'){
      index = self.indexOf(index);
    }

    self.splice(index, 1);
    
    return self;
  },
  
  
  /**
   * Returns the first Record in the Collection
   * 
   * @area Collection
   * @method first
   *
   * @return {Record}
   */ 
  first: function(){
    return this[0];
  },
  
  /**
   * Returns the last Record in the Collection
   * 
   * @area Collection
   * @method last
   *
   * @return {Record}
   */
  last: function(){
    return this[this.length - 1];
  }
};