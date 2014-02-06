/*
 * MODEL
 */

exports.model = {
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
        throw new Error("Can't find record!");
        return false;
      }
      
      return true;
    }, 10);
    
  }
};