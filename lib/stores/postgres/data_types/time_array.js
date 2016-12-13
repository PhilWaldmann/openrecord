
exports.store = {

  mixinCallback: function(){

    this.addType('time_array', this.toArrayCastTypes('time'), {
      migration:{
        timeArray: 'time[]'
      }
    });

  }
};
