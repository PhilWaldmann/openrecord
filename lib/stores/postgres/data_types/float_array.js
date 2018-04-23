exports.store = {
  mixinCallback: function() {
    this.addType('float_array', this.toArrayCastTypes('float'), {
      array: true,
      migration: {
        floatArray: 'float[]'
      }
    })
  }
}
