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


global.beforeGraphQL = function(database, done){
  database = 'graphql_' + database
  var file1 = path.join(__dirname, database + '1.sqlite3')
  var file2 = path.join(__dirname, database + '2.sqlite3')


  var sql1 = [
    'CREATE TABLE authors(id serial primary key, name TEXT, email TEXT, active boolean)',
    'CREATE TABLE recipes(id serial primary key, title TEXT, description TEXT, author_id INTEGER, rating INTEGER)',
    'CREATE TABLE ingredients(id serial primary key, name TEXT, food_id INTEGER)',
    'CREATE TABLE recipe_ingredients(id serial primary key, recipe_id INTEGER, ingredient_id INTEGER, amount REAL, unit TEXT)',
    'CREATE TABLE recipe_images(id serial primary key, recipe_id INTEGER, path TEXT)',
    "INSERT INTO authors(name, email, active) VALUES('phil', 'phil@mail.com', true), ('michl', 'michl@mail.com', false), ('admin', 'admin@mail.com', true)",
    "INSERT INTO recipes(title, description, author_id, rating) VALUES('Toast Hawaii', 'take a toast, some pinapple and toast it', 1, 4), ('scrambled eggs', 'scramble your eggs until done', 1, 3), ('Steak', 'First of all: you need good quality beef.', 1, 5), ('Spinach Enchiladas', 'If you like spinach and Mexican food, you will love these easy vegetarian enchiladas made with ricotta cheese and spinach.', 2, 2)",
    "INSERT INTO ingredients(name, food_id) VALUES('toast', 1), ('pinapple', 2), ('cheese', 3), ('eggs', 4), ('salt', 5), ('pepper', 6), ('ribeye steak', 7), ('butter', 8), ('onions', 9), ('garlic', 10), ('spinach', 11), ('ricotta cheese', 12), ('sour creme', 13), ('corn tortillas', 14), ('enchilada sauce', 15), ('tomahawk steak', 7), ('sea salt', 5), ('kosher salt', 5)",
    "INSERT INTO recipe_ingredients(recipe_id, ingredient_id, amount, unit) VALUES(1, 1, 1, 'slice'), (1, 2, 1, 'slice'), (1, 3, 1, 'slice'), (1, 8, NULL, NULL), (2, 4, 4, 'piece'), (2, 5, 1, 'touch'), (2, 6, 1, 'touch'), (2, 8, 20, 'g'), (3, 7, 500, 'g'), (4, 8, 1, 'tbp'), (4, 9, 0.5, 'piece'), (4, 10, 2, 'gloves'), (4, 11, 250, 'g'), (4, 12, 1, 'cup'), (4, 13, 0.5, 'g'), (4, 14, 10, NULL), (4, 15, 1, 'can')",
    "INSERT INTO recipe_images(recipe_id, path) VALUES(1, 'toast1.jpg'), (1, 'toast2.jpg'), (2, 'eggs.jpg'), (3, 'steak1.jpg'), (3, 'steak2.jpg'), (3, 'steak3.jpg'), (3, 'steak4.jpg'), (4, 'enchiladas.jpg')"
  ]

  var sql2 = [
    'CREATE TABLE food(id serial primary key, name TEXT, energy REAL, protein REAL, carbs REAL, fat REAL, salt REAL)',
    'CREATE TABLE alternatives(food_id INTEGER, alternative_id INTEGER)', // these are random numbers!!
    "INSERT INTO food(name, energy, protein, carbs, fat, salt) VALUES('toast', 120,  0.2, 80, 1.3, 2), ('pinapple', 80, 2, 20, 3, 0.1), ('cheese', 150, 20, 10, 60, 4), ('eggs', 80, 50, 1, 50, 0), ('salt', 0, 0, 0, 0, 100), ('pepper', 1, 0, 0, 0, 0), ('beef', 120, 30, 40, 30, 2), ('butter', 200, 1, 10, 90, 0), ('onions', 10, 1, 3, 0, 0), ('garlic', 10, 2, 0.4, 0, 0), ('spinach', 60, 0.5, 10, 0.2, 0), ('ricotta cheese', 140, 10, 30, 40, 0), ('sour creme', 250, 1, 20, 90, 1), ('corn tortillas', 175.5, 1, 80, 10, 5), ('enchilada sauce', 175, 1, 50, 10, 12), ('whole wheat toast', 105,  0.2, 70, 1.3, 2)",
    'INSERT INTO alternatives(food_id, alternative_id) VALUES(1, 16)'
  ]

  beforeSQLite(file1, sql1, function(){
    beforeSQLite(file2, sql2, function(){
      var store1 = new Store({
        type: 'sqlite3',
        file: file1,
        plugins: [
          require('../../lib/graphql'),
          require('../fixtures/plugins/promise-plugin')
        ]
      })
      .graphQuery('authors', {list: true})
      .graphQuery('author_count', {model: 'Author', handler: 'count'})
      .graphQuery('recipe')
      .graphQuery('ingredient')
      .graphQuery('me', {model: 'Author', handler: 'me'})
      .graphMutation('createRecipe', {model: 'Recipe', handler: 'create'})
      .graphMutation('updateRecipe', {model: 'Recipe', handler: 'findAndUpdate'})
      .graphMutation('destroyRecipe', {model: 'Recipe', handler: 'findAndDestroy'})

      store1.Model('Author', function(){
        this.hasMany('recipes')
        this.hasMany('topRatedRecipes', {model: 'Recipe', scope: 'topRated'})

        this.graphQuery('author', function(input){
          return this.find(input.id).where({active: true})
        }, {
          input: {
            id: {
              type: 'integer',
              required: true,
              description: 'author id'
            }
          }
        })


        this.graphMutation('createAuthor', function(input){
          input.active = true
          input.recipes = [{
            title: 'Example recipe',
            description: 'Your first example recipe',
            rating: 1
          }]
          return this.create(input)
        }, {
          input: {
            name: {
              type: 'string',
              required: true,
              description: 'author name'
            },
            email: {
              type: 'string',
              required: true,
              description: 'author email'
            }
          }
        })

        this.getter('info', function(){
          return this.name + ' <' + this.email + '>'
        }, String)

        this.scope('me', function(){
          this.find(this.context.id)
        })
      })

      store1.Model('Recipe', function(){
        this.belongsTo('author')
        this.hasMany('recipe_ingredients')
        this.hasMany('ingredients', {through: 'recipe_ingredients', relation: 'ingredient'})
        this.hasMany('images', {model: 'RecipeImage'})

        this.scope('topRated', function(){
          this.order('rating', true)
        })

        this.staticMethod('findAndUpdate', function(data){
          return this.find(data.id).exec()
          .then(function(record){
            record.set(data)
            return record.save()
          })
        }, {
          args: ['id', 'writable_attributes']
        })

        this.staticMethod('findAndDestroy', function(id){
          return this.find(id).exec()
          .then(function(record){
            return record.destroy()
          })
        }, {
          args: ['id'],
          args_mapping: ['id'],
          return_type: 'boolean'
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

        this.method('total_amount', function(){
          return this.recipe_ingredients.sum('amount').exec()
        }, {
          return_type: 'float'
        })
      })

      store1.Model('RecipeImage', function(){
        this.belongsTo('recipe')
      })

      var store2 = new Store({
        type: 'sqlite3',
        file: file2,
        name: 'store2',
        plugins: [
          require('../../lib/graphql'),
          require('../fixtures/plugins/promise-plugin')
        ]
      })

      store2.Model('Food', function(){
        this.hasMany('alternatives')
        this.hasMany('alternative_foods', {through: 'alternatives'})
      })

      store2.Model('Alternative', function(){
        this.belongsTo('food')
        this.belongsTo('alternative', {model: 'Food'})
      })

      store1.ready(function(){
        store2.ready(function(){
          done(store1, store2)
        })
      })
    })
  })
}

global.afterGraphQL = function(database){
  database = 'graphql_' + database
  var file1 = path.join(__dirname, database + '1.sqlite3')
  var file2 = path.join(__dirname, database + '2.sqlite3')

  afterSQLite(file1)
  afterSQLite(file2)
}
