
exports.store = {

  mixinCallback: function(){
    
    this.addType('boolean_array', this.toArrayCastTypes('boolean'), {
      migration:{
        booleanArray: 'boolean[]'
      }
    });    
        
  }
};
