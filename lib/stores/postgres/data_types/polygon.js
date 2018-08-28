const geom = require('./_geom')

exports.store = {
  mixinCallback: function() {
    this.addType(
      'polygon',
      {
        read: function(value) {
          if(Array.isArray(value)) return value
          if(typeof value === 'string') return geom.convertPoints(value.replace(/(^\(|\)$)/g, ''))
          return null
        },

        write: function(value) {
          if(Array.isArray(value)) return '(' + geom.pointsToString(value) + ')'
          return value
        }
      },
      {
        array: true,
        migration: ['polygon']
      }
    )
  }
}
