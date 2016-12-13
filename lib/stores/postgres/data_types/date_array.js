
exports.store = {

  mixinCallback: function(){

    this.addType('date_array', this.toArrayCastTypes('date'), {
      migration:{
        dateArray: 'date[]'
      }
    });

  }
};
