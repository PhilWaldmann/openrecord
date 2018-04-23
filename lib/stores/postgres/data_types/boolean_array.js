exports.store = {
  mixinCallback: function() {
    this.addType('boolean_array', this.toArrayCastTypes('boolean'), {
      array: true,
      migration: {
        booleanArray: 'boolean[]'
      }
    })
  }
}
