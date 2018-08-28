const geom = require('./_geom')

// TODO: somehow indicate `open` or `closed` paths
// `where the points are the end points of the line segments comprising the path. Square brackets ([]) indicate an open path, while parentheses (()) indicate a closed path. When the outermost parentheses are omitted, as in the third through fifth syntaxes, a closed path is assumed.`
exports.store = {
  mixinCallback: function() {
    this.addType(
      'path',
      {
        read: function(value) {
          if(Array.isArray(value)) return value
          if(typeof value === 'string') return geom.convertPoints(value.replace(/(^(\[|\()|(\]|\))$)/g, ''))
          return null
        },

        write: function(value) {
          if(Array.isArray(value)) return '[' + geom.pointsToString(value) + ']'
          return value
        }
      },
      {
        array: true,
        migration: ['path', 'lseg']
      }
    )
  }
}
