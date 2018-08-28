exports.store = {
  mixinCallback: function() {
    var store = this

    this.addType(
      'tsvector',
      {
        output: function(val) {
          if (!val) return {}
          return val
        },

        read: function(value) {
          var obj = {}

          // quick and dirty tsvector to object converter
          const token = value.match(/('.+?'(:([0-9A-D]|,)+|))/g)

          if(token){
            token.forEach(function(v){
              var txt = v.replace(/('(.+?)'(:([0-9A-D]|,)+|))/, '$2')
              obj[txt] = v.replace(/('(.+?)'(:([0-9A-D]|,)+|))/, '$3').split(',')
              obj[txt][0] = obj[txt][0].replace(':', '')
              if(obj[txt][0] === '') obj[txt] = []
            })
          }else{
            obj[token] = []
          }

          return obj
        },

        write: function(value) {
          return store.connection.raw("to_tsvector(?)", [value])
        }
      },
      {
        array: true,
        migration: ['tsvector'],
        operators: {
          default: ['matches'],

          matches: {
            defaultMethod: function(attr, value, query, cond) {
              query.whereRaw(attr + "@@ to_tsquery(?)", [value])
            }
          }
        }
      }
    )
  }
}
