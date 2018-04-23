exports.store = {
  mixinCallback: function() {
    this.toArrayCastTypes = function(fromType) {
      var type = this.attributeTypes[fromType]
      if (type) {
        var castfn = function(castType, attribute) {
          return function(value) {
            if (value === null) return null
            if (typeof value === 'string' && value.match(/^\{(.*)\}$/)) {
              value = value.replace(/(^\{|\}$)/g, '')
              if (value === '') {
                value = []
              } else {
                value = value.split(',')
              }
            }

            if (!Array.isArray(value)) value = [value]

            for (var i = 0; i < value.length; i++) {
              value[i] = type.cast[castType].call(this, value[i], attribute)
            }

            return value
          }
        }

        var tmp = {}

        for (var castType in type.cast) {
          if (typeof type.cast[castType] === 'function') {
            tmp[castType] = castfn(castType)
          }
        }

        return tmp
      }
    }
  }
}
