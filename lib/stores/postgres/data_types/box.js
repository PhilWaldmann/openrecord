const geom = require('./_geom')

exports.store = {
  mixinCallback: function() {
    this.addType(
      'box',
      {
        read: function(value) {
          return geom.convertPoints(value)
        },

        write: function(value) {
          if(Array.isArray(value)) return geom.pointsToString(value)
          return value
        }
      },
      {
        array: true,
        migration: ['box']
      }
    )
  }
}
