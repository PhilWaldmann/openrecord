
exports.store = {

  mixinCallback: function(){
    
    this.addType('datetime_array', this.toArrayCastTypes('datetime'), {
      migration:{
        datetimeArray: 'timestamp[]'
      }
    });    
        
  }
};
