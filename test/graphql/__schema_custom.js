const graphQLTools = require('graphql-tools')
const graphql = require('graphql')

module.exports = function(store1, store2) {
  const resolve = store1.graphQLResolveHelper
  const Author = store1.Model('Author')
  const Ingredient = store1.Model('Ingredient')
  const Recipe = store1.Model('Recipe')
  const Food = store2.Model('Food')

  const rootQuery = `
    # here we extend the Author type
    extend type Author {
      name(upper: Boolean): String
      info: String
      recipes: RecipeConnection!
      topRatedRecipes: [Recipe]
    }

    extend type Recipe {
      author: Author
      ingredients(limit: Int): IngredientConnection!
    }

    # we ignore the openrecord generated type and write it our own
    type Ingredient {
      id: Int!
      name: String
      food_id: Int
      total_amount: Float
      food: Food
    }

    type IngredientConnection{
      nodes: [Ingredient]
      totalCount: Int!
    }

    extend type Food {
      alternatives: [Food]
    }

    type RecipeConnection{
      nodes: [Recipe]
      totalCount: Int!
    }

    type Query {
      author(id: Int!): Author
      authors(limit: Int): [Author]
      author_count: Int!
      recipe(id: Int!): Recipe
      recipes(limit: Int = 10): RecipeConnection!
      ingredient(id: Int!): Ingredient
    }

    extend type Query {
      me: Author
    }


    input RecipeInput {
      title: String
      description: String
      author_id: Int
    }

    input AuthorInput {
      name: String
      email: String
    }

    type Mutation {
      createRecipe(input: RecipeInput!): Recipe
      updateRecipe(id: Int!, input: RecipeInput!): Recipe
      destroyRecipe(id: Int!): Boolean
      createAuthor(input: AuthorInput!): Author
    }
  `

  const resolvers = {
    Query: {
      author: resolve(function(args) {
        return Author.find(args.id).where({ active: true })
      }),
      authors: resolve(function(args) {
        return Author.limit(args.limit)
      }),
      author_count: resolve(function() {
        return Author.count()
      }),
      recipe: resolve(function(args) {
        return Recipe.find(args.id)
      }),
      // recipe: function(a, args){ return Recipe.find(args.id) }, // TODO: should work to!
      recipes: resolve(function(args) {
        return {
          nodes: Recipe.limit(args.limit),
          totalCount: Recipe.count()
        }
      }),
      ingredient: resolve(function(args) {
        return Ingredient.find(args.id)
      }),
      me: resolve(function() {
        return Author.me()
      })
    },

    Mutation: {
      createRecipe: resolve(function(args) {
        return Recipe.create(args.input)
      }),
      updateRecipe: resolve(function(args) {
        return Recipe.findAndUpdate(args.id, args.input)
      }),
      destroyRecipe: resolve(function(args) {
        return Recipe.findAndDestroy(args.id)
      }),
      createAuthor: resolve(function(args) {
        return Author.createActive(args.input)
      })
    },

    Author: {
      name: function(record, args) {
        return record.name$(args)
      }
    }
  }

  const author = Author.toGraphQLType({
    exclude: ['name']
  })

  const schema = graphQLTools.makeExecutableSchema({
    typeDefs: [author, Recipe.toGraphQLType(), Food.toGraphQLType(), rootQuery],
    resolvers
  })

  return function query(query, context, variables, operation) {
    return graphql.graphql(schema, query, null, context, variables, operation)
  }
}
