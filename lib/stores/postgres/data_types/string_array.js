
exports.store = {

  mixinCallback: function(){
    
    this.addType('string_array', this.toArrayCastTypes('string'), {
      migration:{
        stringArray: 'varchar[]'
      }
    });    
        
  }
};
