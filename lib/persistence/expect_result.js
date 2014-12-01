var Store = require('../store');

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
   * @class Model
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
      this.logger.trace('persistent/expect_result', data);
      var expectResult = this.getInternal('expectResult');

      if(expectResult && (!data.result || data.result.length == 0)){
        throw new Store.RecordNotFoundError(this);
      }
      
      return true;
    }, 10);
    
  }
};