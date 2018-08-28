exports.store = {
  mixinCallback: function() {
    this.addType(
      'circle',
      {
        read: function(value) {
          return value
        },

        write: function(value) {
          if(typeof value === 'object') return '<(' + value.x +',' + value.y + '),' + value.radius + '>'
          return value
        }
      }
    )
  }
}
