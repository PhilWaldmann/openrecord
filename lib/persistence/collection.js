/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){   
    var self = this;
           
    this.afterFind(function(data){

      var as_json = this.getInternal('as_json');
      var as_raw = this.getInternal('as_raw');
      var records = data.result;

      if(as_json !== true){
        // CREATE RECORDs WITH DATA
        for(var i = 0; i < records.length; i++){
          records[i] = this.new(records[i], 'read');
          records[i]._exists();
        }

        data.result = this;
      }else{
        //RETURN RAW JSON
        if(!as_raw){
          var allowed_attributes = this.getInternal('allowed_attributes');
          var dummy_record = this.new();
        
          for(var i = 0; i < records.length; i++){
            dummy_record.relations = {};
            dummy_record.set(records[i], 'read');
            records[i] = dummy_record.toJson(allowed_attributes);
          }
        }
      }
      
      return true;
    }, 55);
    
  }
};


/*
 * MODEL
 */
exports.model = {
  /**
   * Creates a new record and saves it
   * @class Model
   * @method create
   * @param {object} data - The data of the new record
   * @param {function} resolve - The resolve callback
   * @param {function} reject - The reject callback
   * 
   * @callback
   * @param {boolean} result - true if the create was successful
   * @this Record
   *
   * @return {Model}
   * @see Model.save()
   */
  create: function(data, resolve, reject){
    //TODO: allow to create multiple records at once
    return this.new(data).save(resolve, reject);
  },
  
  
  /**
   * `exec()` will return raw JSON instead of records
   * @class Model
   * @method asJson
   * @param {array} allowed_attributes - Optional: Only export the given attributes and/or relations
   *
   * @return {Model}
   * @see Model.exec()
   */
  asJson: function(allowed_attributes){
    var self = this.chain();
    
    self.setInternal('as_json', true);
    
    if(allowed_attributes instanceof Array) self.setInternal('allowed_attributes', allowed_attributes);
  
    return self;
  }
};



/*
 * CHAIN
 */
exports.chain = {  
  _exists: function(){
    for(var i = 0; i < this.length; i++){
      this[i]._exists(); 
    }
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
    Object.defineProperty(this, '__exists', {enumerable: false, writable: true, value: false});    
    
  },
  
  _exists: function(){
    this.__exists = true;
    this.changes = {}; //Hard-Reset all changes
    
    for(var name in this.definition.relations){
      if(this.definition.relations.hasOwnProperty(name)){
        var relation = this.definition.relations[name];
        if(this.relations[name]){
          this.relations[name]._exists();
        }
      }
    }
  }
};

