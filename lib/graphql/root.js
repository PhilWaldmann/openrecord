exports.store = {

  mixinCallback: function(){
    this.graphqlRoots = {}
  },

  graphRoot: function(name, options){
    const Store = require('../store')

    var self = this

    options = options || {}
    options.model = options.model || name
    options.name = name

    if(!name) throw new Error('no name given!')
    if(!options.model) throw new Error('no model given!')
    if(!options.handler) throw new Error('no handler given!')
    if(!options.type) throw new Error('no type given!')

    self.utils.getStore(Store, options.store, self, function(store){
      self.utils.getModel(store, options.model, function(model){
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


exports.definition = {
  /**
   * Helper function to create a graphql root query
   * @param  {string}   name    The query name
   * @param  {Function} fn      the function to execute
   * @param  {Object}   options options
   * @return {definition}       Returns the definition object
   */
  graphQuery: function(name, fn, options){
    this.scope(name, fn, {args: options.input})
    this.store.graphQuery(name, {
      handler: name,
      model: this.model_name,
      list: options.list
    })
    return this
  },



  /**
   * Helper function to create a graphql mutation
   * @param  {string}   name    The query name
   * @param  {Function} fn      the function to execute
   * @param  {Object}   options options
   * @return {definition}       Returns the definition object
   */
  graphMutation: function(name, fn, options){
    this.staticMethod(name, fn, {args: options.input})
    this.store.graphMutation(name, {
      handler: name,
      model: this.model_name
    })
    return this
  }
}
