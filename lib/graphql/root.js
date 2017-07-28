const Utils = require('../utils')
const Store = require('../store')

exports.store = {

  mixinCallback: function(){
    this.graphqlRoots = {}
  },

  graphRoot: function(name, options){
    var self = this

    options = options || {}
    options.model = options.model || name
    options.name = name

    if(!name) throw new Error('no name given!')
    if(!options.model) throw new Error('no model given!')
    if(!options.type) throw new Error('no type given!')

    Utils.getStore(Store, options.store, self, function(store){
      Utils.getModel(store, options.model, function(model){
        if(!model[options.scope]) throw new Error('unknown scope "' + options.scope + '"')

        options.model = model
        self.graphqlRoots[name] = options
      })
    })

    return this
  },



  graphList: function(name, options){
    options = options || {}
    options.type = 'list'

    if(!options.scope) options.scope = 'limit'

    return this.graphRoot(name, options)
  },



  graphGet: function(name, options){
    options = options || {}
    options.type = 'get'

    if(!options.scope) options.scope = 'find'

    return this.graphRoot(name, options)
  }
}
