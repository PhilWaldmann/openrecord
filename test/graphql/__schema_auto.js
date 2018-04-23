const graphQLTools = require('graphql-tools')
const graphql = require('graphql')

module.exports = function(store1, store2) {
  const schema = graphQLTools.makeExecutableSchema({
    typeDefs: [store1.toGraphQLTypeDefs(), store2.toGraphQLTypeDefs()],
    resolvers: store1.toGraphQLResolvers()
  })

  return function query(query, context, variables, operation) {
    return graphql.graphql(schema, query, null, context, variables, operation)
  }
}
