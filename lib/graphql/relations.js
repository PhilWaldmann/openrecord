/*
 * DEFINITION
 */
const DEFAULT_OPTIONS = {
  nodes: function() {
    return this
  },
  totalCount: function() {
    return this.totalCount()
  }
}

exports.definition = {
  relation: function(name, options) {
    if (options.graphql) {
      if (options.graphql === 'relay') {
        options.graphql = Object.assign({}, DEFAULT_OPTIONS)
      }

      if (typeof options.graphql !== 'object')
        throw new Error('graphql option must be an object')

      options.getter = function() {
        // this.relations is the relations object of the record!
        var result = this['_' + name]

        if (result === undefined) {
          result = options.collection(this)
        }

        result.__multi_resolver = true

        const obj = {}
        Object.keys(options.graphql).forEach(function(key) {
          if (typeof options.graphql[key] !== 'function')
            throw new Error('graphql.' + key + ' must be a function')
          obj[key] = options.graphql[key].bind(result)
        })

        return Promise.resolve(obj)
      }
    }

    this.callParent(name, options)
  }
}
