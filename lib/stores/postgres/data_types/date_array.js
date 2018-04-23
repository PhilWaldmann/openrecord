exports.store = {
  mixinCallback: function() {
    this.addType('date_array', this.toArrayCastTypes('date'), {
      array: true,
      migration: {
        dateArray: 'date[]'
      }
    })
  }
}
