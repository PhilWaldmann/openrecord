
exports.store = {

  mixinCallback: function(){

    this.addType('float_array', this.toArrayCastTypes('float'), {
      migration:{
        floatArray: 'float[]'
      }
    });

  }
};
