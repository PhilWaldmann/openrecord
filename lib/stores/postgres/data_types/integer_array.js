
exports.store = {

  mixinCallback: function(){
    
    this.addType('integer_array', this.toArrayCastTypes('integer'), {
      migration:{
        integerArray: 'integer[]'
      }
    });    
        
  }
};
