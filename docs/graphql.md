# GraphQL with OPENRECORD

To get started with [GraphQL](http://graphql.org/) you'll need to install the [graphql](https://www.npmjs.com/package/graphql) and [graphql-tools](https://www.npmjs.com/package/graphql-tools) package.

OPENRECORD offers you differen helper methods, depending on the degree of control you want to have.  
To activate the helper methods add the following plugin to your [store config](./setup.md)

```js
const store = new Store({
  // ... you store config here ...
  plugins: [
    require('openrecord/lib/graphql')
  ]
})
```

## graphQLResolveHelper(fn)

Your store now has a `graphQLResolveHelper(fn)` method. This method will automatically [include](./query#preloading-relations) your relations, if asked in the graphql query.  
Here is a simlpe example with two models: `Thread` and `Post`, where a `Thread` will contain multiple `posts`.  
The following code will create the schema which could be used by the `graphql` package.

```js
// ./schema.js
const graphQLTools = require('graphql-tools')
const store = require('./store')
const resolve = store.graphQLResolveHelper

const Thread = store.Model('Thread')

const typeDefs = `
type Thread {
  id: Int!
  title: String!
  posts: [Post]
}

type Post {
  id: Int!
  content: String!
}

type Query{
  thread(id: Int!): Thread
}
`

resolvers = {
  Query: {
    thread: resolve(({id}) => Thread.get(id))
  }
}

module.exports = graphQLTools.makeExecutableSchema({
  typeDefs,
  resolvers
})
```

Now you could query a thread by id:

```gql
query{
  thread(id: 1){
    title
    posts{
      content
    }
  }
}
```

OPENRECORD will automatically load all requested information.

Lets extend our example to include a `threads` root query:

```js
const typeDefs = `
...
type ThreadConnection{
  nodes: [Thread]
  totalCount: Int
}

type Query{
  thread(id: Int!): Thread
  threads(limit: Int = 10): ThreadConnection!
}
`

resolvers = {
  Query: {
    thread: resolve(({id}) => Thread.get(id)),
    threads: resolver(args => ({
      nodes: Thread.limit(args.limit),
      totalCount: Thread.totalCount()
    }))
  }
}
...
```

The following query will search your datastore only 3 times. One request for the threads, one for all posts related to the loaded threads and a last one for the total count.
If we would query only the total count, only one request to your datastore would be executed.

```gql
query{
  threads(limit: 100){
    nodes{
      title
      posts{
        content
      }
    }
    totalCount
  }
}
```

## toGraphQLResolvers()

If you like, you could also define your resolvers inside your [model definition](./definition.md). The `toGraphQLResolvers()` will consolidate all resolvers and returns a single object.  
The `definition scope` contains the following methods: `graphQLQueryResolver`, `graphQLMutationResolver`, `graphQLTypeResolver` and `graphQLResolver`.

Let's rewrite the example from above

```js
// ./models/Thread.js
module.exports = function Thread(){
  this.hasMany('posts')

  this.graphQLQueryResolver({
    thread: ({id}) => this.model.get(id),
    threads: args => ({
      nodes: this.model.limit(args.limit),
      totalCount: this.model.totalCount()
    })
  })
}
```

```js
// ./schema.js
const graphQLTools = require('graphql-tools')
const store = require('./store')

const typeDefs = `
type Thread {
  id: Int!
  title: String!
  posts: [Post]
}

type Post {
  id: Int!
  content: String!
}

type ThreadConnection{
  nodes: [Thread]
  totalCount: Int
}

type Query{
  thread(id: Int!): Thread
  threads(limit: Int = 10): ThreadConnection!
}
`

module.export = graphQLTools.makeExecutableSchema({
  typeDefs,
  resolvers: store.toGraphQLResolvers()
})
```

The following methods are available in the `definition scope`

## graphQLQueryResolver(resolver)

Will merge your `resolver` object into the `Query` resolvers.

## graphQLMutationResolver(resolvers)

Simmilar to `graphQLQueryResolver()`, but will add your object to the `Mutation` resolvers.

## graphQLTypeResolver(resolvers)

Will add a resolver to the `<model name>` resolvers.

```js
// ./models/Thread.js
this.graphQLTypeResolver({
  // field definition:
  // title(upper: Boolean = false): String
  title: (record, {upper}) => {
    if(upper) return record.value.toUpperCase()
    return record.value
  }
})
```

## graphQLResolver(resolvers)

The `resolvers` object must contain the type as well.
```js
this.graphQLResolver({
  Query: {
    thread: ({id}) => this.model.get(id)
  }
})
```

would be equivalent to

```js
this.grgraphQLQueryResolveraphQLResolver({
  thread: ({id}) => this.model.get(id)
})
```

## toGraphQLTypeDefs()

You could define your schema in separate file, or include them in your model definition.  
`toGraphQLTypeDefs()` will create types for all your models automatically. **But** there are limitations:
* It only supports basic types (e.g. a `Date` will be of type `String` for graphql)
* Does not automatically add your relations (Maybe you want to add filtering or pagination)
* Adds all attributes, if not excluded explicitly

!> This is not the right solution if you want to use autocompletion or simmilar features for graphql

```js
// ./schema.js
const graphQLTools = require('graphql-tools')
const store = require('./store')

module.export = graphQLTools.makeExecutableSchema({
  typeDefs: store.toGraphQLTypeDefs(),
  resolvers: store.toGraphQLResolvers()
})
```

The following methods are available in the `definition scope`

## graphQLExclude()

Call to exclude the model from type definitions

## graphQLDescription(description)

Add a type description

## graphQLField(fieldDef)

Add or overwrite a field definition with:

```js
this.graphQLField('title(upper: Boolean = false): String')
```

## graphQLExcludeField(name)

To exclude a field from the autogenerated graphql type

## graphQLQuery(queries)

Add graphql root query definitions

```js
this.graphQLQuery(`
  thread(id: Int!): Thread
  threads(limit: Int = 10): ThreadConnection!
`)
```

## graphQLMutation(mutations)

Add graphql mutation definitions

```js
this.graphQLQuery(`
  createThread(title: String!): Thread
`)
```

## graphQL(typeDef)

Add any graphql type definitions

```js
this.graphQL(`
  type ThreadConnection{
    nodes: [Thread]
    totalCount: Int
  }
`)
```