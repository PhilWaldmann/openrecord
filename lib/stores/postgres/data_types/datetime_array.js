exports.store = {
  mixinCallback: function() {
    this.addType('datetime_array', this.toArrayCastTypes('datetime'), {
      array: true,
      migration: {
        datetimeArray: 'timestamp[]'
      }
    })
  }
}
