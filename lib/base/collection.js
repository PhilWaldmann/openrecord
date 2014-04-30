var Utils = require('../utils');

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
   * @section Model
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
 * CHAIN
 */
exports.chain = {
      
  /**
   * Loops all the Records in the Collection
   * 
   * @section Collection
   * @method each
   * @param {function} callback - The method to be called for every record
   *
   * @callback
   * @param {Record} record - The current record
   * @this Collection
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
   * @section Collection
   * @method add
   * @param {array} Record - Either a object which will be transformed into a new Record, or an existing Record
   *
   * @return {Collection}
   */ 
  add: function(records){
    var self = this.chain();
    var relation = this.getInternal('relation');
    var parent_record = this.getInternal('relation_to');
    
    if(!(records instanceof Array)) records = [records];    
        
    for(var i = 0; i < records.length; i++){
      var record = records[i];
      if(typeof record != 'object'){
        if(!relation || !relation.through || !parent_record) continue;

        var through_rel = parent_record.model.definition.relations[relation.through];
        var target_rel = through_rel.model.definition.relations[relation.relation];
        
        var tmp = Utils.clone(through_rel.conditions[through_rel.name]) || {};
            
        tmp[through_rel.foreign_key] = parent_record[through_rel.primary_key];
        tmp[target_rel.primary_key] = record;
                         
        if(through_rel.type == 'has_many'){
          parent_record[relation.through].add(tmp);
        }else{
          parent_record[relation.through] = tmp;
        }
        
      }else{
        if(this.options.polymorph){
          if(!(record instanceof record.model)) return;
        }else{
          if(!(record instanceof self.model)) record = self.model.new(record);  
        }
              
        self.push(record);
      
        if(relation && parent_record){
          self.definition.emit('relation_record_added',parent_record, relation, record);
        } 
      }
    }    
    
    return self;
  },
  
  /**
   * Removes a Record from the Collection
   * 
   * @section Collection
   * @method remove
   * @param {integer} index - Removes the Record on the given index
   * or
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
   * @section Collection
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
   * @section Collection
   * @method last
   *
   * @return {Record}
   */
  last: function(){
    return this[this.length - 1];
  }
};