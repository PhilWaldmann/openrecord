
/*
 * MODEL
 */
exports.model = {
  /**
   * Creates a new record and saves it
   * @section Model
   * @method create
   * @param {object} data - The data of the new record
   * @param {function} callback - The save callback
   * 
   * @callback
   * @param {boolean} result - true if the create was successful
   * @this Record
   *
   * @return {Model}
   * @see Model.save()
   */
  create: function(data, fn){
    //TODO: allow to create multiple records at once
    this.new(data).save(fn);
    return this;
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