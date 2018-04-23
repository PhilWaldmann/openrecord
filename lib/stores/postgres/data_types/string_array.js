exports.store = {
  mixinCallback: function() {
    this.addType('string_array', this.toArrayCastTypes('string'), {
      array: true,
      migration: {
        stringArray: 'varchar[]'
      }
    })
  }
}
