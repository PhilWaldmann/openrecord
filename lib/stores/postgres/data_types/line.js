const geom = require('./_geom')

exports.store = {
  mixinCallback: function() {
    this.addType(
      'line',
      {
        read: function(value) {
          if(Array.isArray(value)) return value
          if(typeof value === 'string'){
            const parts = value
            .replace(/(^{|}$)/g, '')
            .split(',')
            .map(parseFloat)
            return {A: parts[0], B: parts[1], C: parts[2]}
          }
          return null
        },

        write: function(value) {
          if(Array.isArray(value)) return '[' + geom.pointsToString(value) + ']'
          if(typeof value === 'object') return '{' + value.A +',' + value.B + ',' + value.B + '}'
          return value
        }
      },
      {
        array: true,
        migration: ['line']
      }
    )
  }
}
