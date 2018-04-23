exports.definition = {
  hasOne: function(name, options) {
    options = options || {}

    options.initialize = function() {
      this.callParent()
    }

    // hasMany relation only returns a single record!
    options.transform =
      options.transform ||
      function(result) {
        if (!result) return
        return result[0] || null
      }

    const result = this.hasMany(name, options)

    options.type = 'has_one' // overwrite type!

    return result
  }
}
