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
          records[i] = this.new(records[i]);
          records[i]._exists();
        }
        
        data.result = this;
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
   * @section Model
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
   * @section Model
   * @method asJson
   *
   * @return {Model}
   * @see Model.exec()
   */
  asJson: function(){
    var self = this.chain();
    
    self.setInternal('as_json', true);
  
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

