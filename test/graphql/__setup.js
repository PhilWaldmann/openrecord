var path = require('path')
var Store = require('../../lib/store')

/*

  STRUCTURE

  Store1
    author -< recipes
    recipe >-< ingredients
    recipe -< images

  Store2
    ingredient >- food (nutritional values)
    food -< alternatives
 */


global.beforeGraphQL = function(database, type, done){
  database = 'graphql_' + database
  var file1 = path.join(__dirname, database + '1.sqlite3')
  var db2 = database + '2'


  var sql1 = [
    'CREATE TABLE authors(id serial primary key NOT NULL, name TEXT, email TEXT, active boolean)',
    'CREATE TABLE recipes(id serial primary key NOT NULL, title TEXT, description TEXT, author_id INTEGER, rating INTEGER)',
    'CREATE TABLE ingredients(id serial primary key NOT NULL, name TEXT, food_id INTEGER)',
    'CREATE TABLE recipe_ingredients(id serial primary key NOT NULL, recipe_id INTEGER, ingredient_id INTEGER, amount REAL, unit TEXT)',
    'CREATE TABLE recipe_images(id serial primary key NOT NULL, recipe_id INTEGER, path TEXT)',
    "INSERT INTO authors(name, email, active) VALUES('phil', 'phil@mail.com', true), ('michl', 'michl@mail.com', false), ('admin', 'admin@mail.com', true)",
    "INSERT INTO recipes(title, description, author_id, rating) VALUES('Toast Hawaii', 'take a toast, some pinapple and toast it', 1, 4), ('scrambled eggs', 'scramble your eggs until done', 1, 3), ('Steak', 'First of all: you need good quality beef.', 1, 5), ('Spinach Enchiladas', 'If you like spinach and Mexican food, you will love these easy vegetarian enchiladas made with ricotta cheese and spinach.', 2, 2)",
    "INSERT INTO ingredients(name, food_id) VALUES('toast', 1), ('pinapple', 2), ('cheese', 3), ('eggs', 4), ('salt', 5), ('pepper', 6), ('ribeye steak', 7), ('butter', 8), ('onions', 9), ('garlic', 10), ('spinach', 11), ('ricotta cheese', 12), ('sour creme', 13), ('corn tortillas', 14), ('enchilada sauce', 15), ('tomahawk steak', 7), ('sea salt', 5), ('kosher salt', 5)",
    "INSERT INTO recipe_ingredients(recipe_id, ingredient_id, amount, unit) VALUES(1, 1, 1, 'slice'), (1, 2, 1, 'slice'), (1, 3, 1, 'slice'), (1, 8, NULL, NULL), (2, 4, 4, 'piece'), (2, 5, 1, 'touch'), (2, 6, 1, 'touch'), (2, 8, 20, 'g'), (3, 7, 500, 'g'), (4, 8, 1, 'tbp'), (4, 9, 0.5, 'piece'), (4, 10, 2, 'gloves'), (4, 11, 250, 'g'), (4, 12, 1, 'cup'), (4, 13, 0.5, 'g'), (4, 14, 10, NULL), (4, 15, 1, 'can')",
    "INSERT INTO recipe_images(recipe_id, path) VALUES(1, 'toast1.jpg'), (1, 'toast2.jpg'), (2, 'eggs.jpg'), (3, 'steak1.jpg'), (3, 'steak2.jpg'), (3, 'steak3.jpg'), (3, 'steak4.jpg'), (4, 'enchiladas.jpg')"
  ]

  var sql2 = [
    'CREATE TABLE food(id serial primary key NOT NULL, name TEXT, energy REAL, protein REAL, carbs REAL, fat REAL, salt REAL)',
    'CREATE TABLE alternatives(food_id INTEGER NOT NULL, alternative_id INTEGER)', // these are random numbers!!
    "INSERT INTO food(name, energy, protein, carbs, fat, salt) VALUES('toast', 120,  0.2, 80, 1.3, 2), ('pinapple', 80, 2, 20, 3, 0.1), ('cheese', 150, 20, 10, 60, 4), ('eggs', 80, 50, 1, 50, 0), ('salt', 0, 0, 0, 0, 100), ('pepper', 1, 0, 0, 0, 0), ('beef', 120, 30, 40, 30, 2), ('butter', 200, 1, 10, 90, 0), ('onions', 10, 1, 3, 0, 0), ('garlic', 10, 2, 0.4, 0, 0), ('spinach', 60, 0.5, 10, 0.2, 0), ('ricotta cheese', 140, 10, 30, 40, 0), ('sour creme', 250, 1, 20, 90, 1), ('corn tortillas', 175.5, 1, 80, 10, 5), ('enchilada sauce', 175, 1, 50, 10, 12), ('whole wheat toast', 105,  0.2, 70, 1.3, 2)",
    'INSERT INTO alternatives(food_id, alternative_id) VALUES(1, 16)'
  ]

  beforeSQLite(file1, sql1, function(){
    beforePG(db2, sql2, function(){
      var store1 = new Store({
        type: 'sqlite3',
        file: file1,
        plugins: [
          require('../../lib/graphql')
        ]
      })

      store1.Model('Author', function(){
        this.hasMany('recipes')
        this.hasMany('topRatedRecipes', {model: 'Recipe', scope: 'topRated'})


        // for auto gen. only!!!
        if(type === 'auto'){
          this
          .graphQLField('name(upper: Boolean): String')
          .graphQLField('info: String')
          .graphQLField('recipes: [Recipe]')
          .graphQLField('topRatedRecipes: [Recipe]')

          .graphQLQuery('author(id: Int!): Author')
          .graphQLQuery('authors(limit: Int): [Author]')
          .graphQLQuery('author_count: Int!')
          .graphQLQuery('me: Author')

          .graphQL(`
            input AuthorInput {
              name: String
              email: String
            }
          `)
          .graphQLMutation('createAuthor(input: AuthorInput!): Author')

          .graphQLResolver({
            name: function(record, args){ return record.name$(args) }
          })
          .graphQLQueryResolver({
            author: function(args){ return this.find(args.id).where({active: true}) },
            authors: function(args){ return this.limit(args.limit) },
            author_count: function(){ return this.count() },
            me: function(){ return this.me() }
          })
          .graphQLMutationResolver({
            createAuthor: function(args){ return this.createActive(args.input) }
          })
        }

        this.variant('name', function(value, args){
          if(args.upper) return value.toUpperCase()
          return value
        })

        this.getter('info', function(){
          return this.name + ' <' + this.email + '>'
        })

        this.scope('me', function(){
          this.find(this.context.id)
        }, true)

        this.staticMethod('createActive', function(input){
          input.active = true
          input.recipes = [{
            title: 'Example recipe',
            description: 'Your first example recipe',
            rating: 1
          }]
          return this.create(input)
        })
      })

      store1.Model('Recipe', function(){
        this.belongsTo('author')
        this.hasMany('recipe_ingredients')
        this.hasMany('ingredients', {through: 'recipe_ingredients', relation: 'ingredient'})
        this.hasMany('images', {model: 'RecipeImage'})


        // for auto gen. only!!!
        if(type === 'auto'){
          this
          .graphQLField('author: Author')
          .graphQLField('ingredients: [Ingredient]')

          .graphQLQuery('recipe(id: Int!): Recipe')

          .graphQL(`
            input RecipeInput {
              title: String
              description: String
              author_id: Int
            }
          `)
          .graphQLMutation('createRecipe(input: RecipeInput!): Recipe')
          .graphQLMutation('updateRecipe(id: Int!, input: RecipeInput!): Recipe')
          .graphQLMutation('destroyRecipe(id: Int!): Boolean')

          .graphQLQueryResolver({
            recipe: function(args){ return this.find(args.id) }
          })
          .graphQLMutationResolver({
            createRecipe: function(args){ return this.create(args.input) },
            updateRecipe: function(args){ return this.findAndUpdate(args.id, args.input) },
            destroyRecipe: function(args){ return this.findAndDestroy(args.id) }
          })
        }



        this.scope('topRated', function(){
          this.order('rating', true)
        })

        this.staticMethod('findAndUpdate', function(id, data){
          return this.find(id).exec()
          .then(function(record){
            record.set(data)
            return record.save()
          })
        })

        this.staticMethod('findAndDestroy', function(id){
          return this.find(id).exec()
          .then(function(record){
            return record.destroy()
          })
          .then(function(){
            return true
          })
        })
      })

      store1.Model('RecipeIngredient', function(){
        this.belongsTo('recipe')
        this.belongsTo('ingredient')
      })

      store1.Model('Ingredient', function(){
        this.hasMany('recipe_ingredients')
        this.hasMany('recipes', {through: 'recipe_ingredients'})
        this.belongsTo('food', {store: 'store2'})

        // for auto gen. only!!!
        if(type === 'auto'){
          this
          .graphQLField('total_amount: Float')
          .graphQLField('food: Food')
          .graphQLQuery('ingredient(id: Int!): Ingredient')
          .graphQLQueryResolver({
            ingredient: function(args){ return this.find(args.id) }
          })
        }

        this.method('total_amount', function(){
          return this.recipe_ingredients.sum('amount').exec()
        })
      })

      store1.Model('RecipeImage', function(){
        this.belongsTo('recipe')
      })

      var store2 = new Store({
        type: 'postgres',
        host: 'localhost',
        database: db2,
        user: 'postgres',
        password: '',
        name: 'store2',
        plugins: [
          require('../../lib/graphql')
        ]
      })

      store2.Model('Food', function(){
        this.hasMany('alternative_foods', {model: 'Alternative'})
        this.hasMany('alternatives', {through: 'alternative_foods', relation: 'alternative'})

        // for auto gen. only!!!
        if(type === 'auto'){
          this.graphQLField('alternatives: [Food]')
        }
      })

      store2.Model('Alternative', function(){
        this.belongsTo('food')
        this.belongsTo('alternative', {model: 'Food', primary_key: 'alternative_id'})
      })

      store2.ready(function(){
        return store1.ready(function(){
          done(null, require('./__schema_' + type + '.js')(store1, store2))
        })
      })
      .catch(function(error){
        done(error)
      })
    })
  })
}

global.afterGraphQL = function(database, next){
  database = 'graphql_' + database
  var file1 = path.join(__dirname, database + '1.sqlite3')
  var db2 = database + '2'

  afterSQLite(file1)
  afterPG(db2, next)
}
