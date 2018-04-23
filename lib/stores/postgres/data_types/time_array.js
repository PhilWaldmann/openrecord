exports.store = {
  mixinCallback: function() {
    this.addType('time_array', this.toArrayCastTypes('time'), {
      array: true,
      migration: {
        timeArray: 'time[]'
      }
    })
  }
}
