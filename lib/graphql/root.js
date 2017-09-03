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
    if(!options.handler) throw new Error('no handler given!')
    if(!options.type) throw new Error('no type given!')

    Utils.getStore(Store, options.store, self, function(store){
      Utils.getModel(store, options.model, function(model){
        if(!model[options.handler]) throw new Error('unknown handler "' + options.handler + '"')

        options.model = model

        self.graphqlRoots[name] = options
      })
    })

    return this
  },



  graphQuery: function(name, options){
    options = options || {}
    options.type = 'query'

    if(!options.handler && options.list) options.handler = 'limit'
    if(!options.handler && !options.list) options.handler = 'find'

    return this.graphRoot(name, options)
  },


  graphMutation: function(name, options){
    options = options || {}
    options.type = 'mutation'

    return this.graphRoot(name, options)
  }
}
