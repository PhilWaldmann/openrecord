exports.store = {
  /**
   * returns a string represing the model as a graphql type
   * @param  {Object} options Optional options
   * @param  {Array} options.exclude Array of fields to exclude
   * @return {String}         The graphql schema
   */
  toGraphQLTypeDefs: function(options) {
    options = options || {}
    var exclude = options.exclude || []
    var schema = []
    var query = []
    var mutation = []

    Object.keys(this.models).forEach(function(modelName) {
      var model = this.models[modelName]
      var definition = model.definition

      if (definition.graphqlHelper.hidden) return // via this.graphQLExclude()
      if (exclude.indexOf(modelName) !== -1) return

      schema.push(model.toGraphQLType())
      schema.push.apply(schema, definition.graphqlHelper.schema)

      query.push.apply(query, definition.graphqlHelper.query)
      mutation.push.apply(mutation, definition.graphqlHelper.mutation)
    }, this)

    if (query.length > 0) {
      schema.push(
        [
          'type Query{',
          query
            .map(function(str) {
              return '  ' + str
            })
            .join('\n'),
          '}'
        ].join('\n')
      )
    }

    if (mutation.length > 0) {
      schema.push(
        [
          'type Mutation{',
          mutation
            .map(function(str) {
              return '  ' + str
            })
            .join('\n'),
          '}'
        ].join('\n')
      )
    }

    return schema.join('\n\n')
  },

  toGraphQLResolvers: function() {
    var resolvers = {
      Query: {},
      Mutation: {}
    }

    Object.keys(this.models).forEach(function(modelName) {
      var model = this.models[modelName]
      var definition = model.definition

      if (definition.graphqlHelper.hidden) return // via this.graphQLExclude()

      // type resolver
      if (definition.graphqlHelper.typeResolver.length > 0) {
        var name = definition.modelName
        resolvers[name] = {}
        definition.graphqlHelper.typeResolver.forEach(function(resolver) {
          Object.assign(resolvers[name], resolver)
        })
      }

      // Query resovler
      definition.graphqlHelper.queryResolver.forEach(function(_resolver) {
        var resolver = {}
        Object.keys(_resolver).forEach(function(key) {
          resolver[key] = definition.store.graphQLResolveHelper(
            _resolver[key].bind(model)
          )
        })
        Object.assign(resolvers.Query, resolver)
      })

      // Mutation resovler
      definition.graphqlHelper.mutationResolver.forEach(function(_resolver) {
        var resolver = {}
        Object.keys(_resolver).forEach(function(key) {
          resolver[key] = definition.store.graphQLResolveHelper(
            _resolver[key].bind(model)
          )
        })
        Object.assign(resolvers.Mutation, resolver)
      })

      // general resolver
      if (definition.graphqlHelper.resolver.length > 0) {
        definition.graphqlHelper.resolver.forEach(function(_resolver) {
          const resolver = {}
          Object.keys(_resolver).forEach(function(typeName) {
            const Type = {}
            resolver[typeName] = Type
            Object.keys(_resolver[typeName]).forEach(function(fieldName) {
              Type[fieldName] = definition.store.graphQLResolveHelper(
                _resolver[typeName][fieldName].bind(model),
                true
              )
            })
          })

          Object.assign(resolvers, resolver)
        })
      }
    }, this)

    if (Object.keys(resolvers.Mutation).length === 0) delete resolvers.Mutation

    return resolvers
  }
}

exports.definition = {
  mixinCallback: function() {
    this.graphqlHelper = {
      description: '',
      hidden: false,
      fields: {},
      exclude: [],
      query: [],
      mutation: [],
      schema: [],
      resolver: [],
      typeResolver: [],
      queryResolver: [],
      mutationResolver: []
    }
  },

  graphQLDescription: function(description) {
    this.graphqlHelper.description = description
    return this
  },

  graphQLField: function(schema) {
    // get the field name in case of overwrites
    var fieldName = schema
      .replace(/#.+$/gm, '') // remove comment
      .replace(/\(.+\)/gm, '') // remove Params
      .replace(/:.+$/gm, '') // remove Type
      .trim() // remove whitespaces

    this.graphqlHelper.fields[fieldName] = schema

    return this
  },

  graphQLExclude: function() {
    this.graphqlHelper.hidden = true
    return this
  },

  graphQLExcludeField: function(field) {
    this.graphqlHelper.exclude.push(field)
    return this
  },

  graphQLQuery: function(schema) {
    this.graphqlHelper.query.push(schema)
    return this
  },

  graphQLMutation: function(schema) {
    this.graphqlHelper.mutation.push(schema)
    return this
  },

  graphQL: function(schema, name) {
    if (typeof schema === 'function' && schema.definition) {
      const type = require('./type')
      schema = type.model.toGraphQLType.call(schema, { name: name })
    }
    this.graphqlHelper.schema.push(schema)
    return this
  },

  graphQLResolver: function(resolver) {
    this.graphqlHelper.resolver.push(resolver)
    return this
  },

  graphQLTypeResolver: function(resolver) {
    this.graphqlHelper.typeResolver.push(resolver)
    return this
  },

  graphQLQueryResolver: function(resolver) {
    this.graphqlHelper.queryResolver.push(resolver)
    return this
  },

  graphQLMutationResolver: function(resolver) {
    this.graphqlHelper.mutationResolver.push(resolver)
    return this
  }
}
