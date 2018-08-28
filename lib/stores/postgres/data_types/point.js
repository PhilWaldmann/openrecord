exports.store = {
  mixinCallback: function() {
    this.addType(
      'point',
      {
        read: function(value) {
          return value
        },

        write: function(value) {
          if(typeof value === 'object') return '(' + value.x +',' + value.y + ')'
          return value
        }
      }
    )
  }
}
