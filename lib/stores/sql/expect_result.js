var Store = require('../../store');

Store.addExceptionType(function RecordNotFoundError(Model){
  Error.apply(this);
  this.message = "Can't find any record for " + Model.definition.model_name;
});


/*
 * MODEL
 */
exports.model = {
  /**
   * When called, it will throw an error if the resultset is empty
   * @section Model
   * @method expectResult
   *
   * @see Model.get
   *
   * @return {Model}
   */
  expectResult: function(){
    var self = this.chain();
    
    self.setInternal('expectResult', true);
    
    return self;
  }
};



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    
    this.afterFind(function(data){
      var expectResult = this.getInternal('expectResult');
      
      if(expectResult && data.result.length == 0){
        this.reject(new Store.RecordNotFoundError(this));
        return false;
      }
      
      return true;
    }, 10);
    
  }
};