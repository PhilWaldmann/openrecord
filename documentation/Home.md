
# Installation

```bash
npm install openrecord
```

## OpenRecord with sqlite3

install `sqlite3` as well

```bash
npm install sqlite3
```

## OpenRecord with postgres

install `pg` as well

```bash
npm install pg
```

## OpenRecord with mysql

install `mysql` as well

```bash
npm install mysql
```

## OpenRecord with REST-Backend

install `restify` as well

```bash
npm install restify
```





# Setup

```js
var OpenRecord = require('openrecord');

var store = new OpenRecord({
	type: 'THE TYPE'
	//... config options ...
});
```

The `type` config option is manditory and defines the store type (e.g. `postgres` or `mysql`). See the following sections for the type specific config options.


### SQLite3

```js
var store = new OpenRecord({
	type: 'sqlite3'
	file: 'mydb.sqlite3',
	migrations: 'path/to/my/migrations/*'
});
```

### Postgres

```js
var store = new OpenRecord({
	type: 'postgres',
	host: 'localhost',
	database: 'mydb',
	username: 'myuser',
	password: 'mypass',
	migrations: 'path/to/my/migrations/*'
});
```

### MySQL

```js
var store = new OpenRecord({
	type: 'mysql',
	host: 'localhost',
	database: 'mydb',
	username: 'myuser',
	password: 'mypass',
	migrations: 'path/to/my/migrations/*'
});
```

### REST

```js
var store = new OpenRecord({
	type: 'rest',
	url: 'http://my-rest-server.com',
	path: 'api/application/', //optional path
	baseParams:{ // optional params which will be included in every search
		param: 'value'
	},
});
```


## Global config options

* `models`: A string or array of model paths which will be loaded on initialization. See [Model definition](#model-definition) for more information.
* `plugins`: A string or array of plugin paths which will be included on initialization. See [Plugins](#plugins) for more information.
* `global`: if `true` OpenRecord will put all models into the global scope. Default: `false`



## ready()

```js
store.ready(function(){
	//store is ready})
```
The `ready` callback will be called after all [models](#model-definition) and [migrations](#migrations) are finished/ready.



## Actionhero Plugin

If you are using [actionherojs](http://actionherojs.com/) you could use the [ah-openrecord](https://github.com/PhilWaldmann/ah-openrecord) plugin.




# Model definition

Models could be defined synchronous or asynchronous. In the simplest form a model definition consists of just an empty function:

```js
store.Model('MyModel', function(){
	//definition goes here});
```

Inside that function your are in the model definition scope. For example setting a [validation](#validations) is as easy as:

```js
store.Model('MyModel', function(){
	this.validatesPresenceOf('name');});
```

### Async

The model definition could also be done asynchronous. If you need to do some async actions before the model is ready (See [ready()](#ready)) just put one param into in model definition function:

```js
store.Model('MyModel', function(done){
	setTimeout(done, 100);});
```

### Load from files

Defining models via the `Model()` method is nice, but if you need to define and load a lot of models it's easier to let OpenRecord do most of the work. Just set the `models` config option on the store and point it to the folder where all your model files are located. e.g. `"./models/*"`. OpenRecord uses [glob](https://github.com/isaacs/node-glob) to find your files. So you could also do `"./models/**/*.js"` to load all javascript files from all subfolders.
The model name will be automatically take from the file name so you just need to define your model definition function:

```js
module.exports = function(){
	//definition goes here}
```

Alternatively you could export a named function to set the model name manually!


## Attributes

A model could have multiple attributes which store the records data. The model's attributes of the store type `sqlite3`, `mysql` and `postgres` are loaded automatically - so you don't need to define them twice. This will happen before your model definition function will be called. _Internally it uses the asynchronous model definition method described above!_

### attribute()

However, if you are using a `REST` store, or need some custom attributes on your model, use the `attribute()` method:

```js
module.exports = function(){
	this.attribute('my_attribute', String);
}
```
	
{{Definition.attribute()}}

OpenRecord has some build in types like `String`, `Number`, `Date`, `Boolean` and `Object`. These types are for custom attributes. But every store type could have it's own attribute types - this depends on the backend. These store dependent types will always map to javascript primitives. So most of the time you don't have to deal with that.

### setter() & getter()

To provide a nice API OpenRecord uses javascript setter and getter. These setters and getters are created automatically for every attribute and [relation](#relations) and provide the magic behind [record.hasChanged()](#attribute-changes).
If you need to create a custom setter or getter for your records use `setter()` or `getter()` to do so. 

{{Definition.setter()}}

{{Definition.getter()}}

## Validations

OpenRecord has a lot of build in validation methods and could be customized and extended easily (See [Plugins](#plugins)). Validations could be applied to a specific attribute or to the whole record. All validation errors are stored inside the `errors` Object of your record (See [errors](#errors)).

Stores that automatically load and define your attributes (`sqlite3`, `postgres` and `mysql`) also automatically apply certain validations based on e.g. `NOT NULL` or `varchar(255)`.

The following validation methods are available for every store type:


{{Definition.validates()}}
	
{{Definition.validatesPresenceOf()}}

{{Definition.validatesConfirmationOf()}}

{{Definition.validatesFormatOf()}}

{{Definition.validatesLengthOf()}}

{{Definition.validatesNumericalityOf()}}

The following validation methods are only available for sql store (`sqlite3`, `postgres` and `mysql`)

{{Definition.validatesUniquenessOf()}}


## Relations

OpenRecord supports `belongs to`, `has many` and `has one` relations as well has `has many through`, `belongs to through` and `polymorphic` relations.

A relation - except for a polymorphic relations - always needs a target model. The model name will be automatically taken from the relation name. If needed, you could always define a custom model name via `model` config option.

The relation will be initialized after the target model is ready - to automatically get the primary and foreign key. The default for the foreign key is `<model_name>_<primary_key>` - all lower case! You could manually set the `primary_key` and `foreign_key` if you need.


{{Definition.hasMany()}}

{{Definition.hasOne()}}

{{Definition.belongsTo()}}


## Hooks

OpenRecord provides you a multitude of build in hooks to intercept or expand the internal parts. Hooks are similar to events, but will always wait for your custom code to complete - either synchronous or asynchronous. All the internal processes are build on top of these hooks. A hook could return one of three "states":

1. `true`: Everything okay - keep going
2. `false`: Stop the process and return `false`
3. `new Error()`: reject the process with an error

For example trying to save an invalid record (some [validations](#validations) failed) will return `false` and stop the process of writing the record into the store. If, for example, the save process failed (e.g. connection lost) OpenRecord will reject it with an `Error`.

Here is an example how to use the `beforeFind()` hook synchronous:

```js
module.exports = function(){
	this.beforeFind(function(){
		this.where({delete_at: null});
		return true;			});
}
```
The above example will add a [condition](#conditions) (`delete_at` should be equal `null`) to every record search of that model. If you need to do some async stuff inside the hook, you could use it asynchronous. The very last param is a callback. If you put that callback into your function's parameters OpenRecord will treat that function asynchronous. _Same concept as model definition function!_

```js
module.exports = function(){
	this.beforeFind(function(query, done){
		this.setTimeout(done, 1000);
	});
}
```

As you could see in the above example, returning anything else except `false` and an `Error`-Object is equal to returning `true`.

The following hooks are available:

{{Definition.beforeFind()}}

{{Definition.afterFind()}}

{{Definition.beforeValidation()}}

{{Definition.afterValidation()}}

{{Definition.beforeSave()}}

{{Definition.afterSave()}}

{{Definition.beforeCreate()}}

{{Definition.afterCreate()}}

{{Definition.beforeUpdate()}}

{{Definition.afterUpdate()}}

{{Definition.beforeDestroy()}}

{{Definition.afterDestroy()}}

## Scopes

As you have seen in the first example of [hooks](#hooks), you are able to define [condition](#conditions) inside the [beforeFind()](#beforefind) hook. This is nice if you always want to apply this conditions - otherwiese you need to define that conditions for every search you do. To give you a kind of macro-like functionality OpenRecord offer you `scopes`.
scopes are little helpers that contains your search criteria and could be used in an recuring fashion.

For example if you need to get all activated users (`activated` is `true`) in 99% of all your searches, you would add `.where({activated: true})` to every search you do. This is okay with one condition but gets messy if you need to apply multiple conditions on every users search you do in your application. With scopes you define your search criteria on one place - in your model definition.

```js
module.exports = function(){
	this.scope('activated', function(){
		this.where({activated: true});	});
}
```

OpenRecord automatically creates the `activated` method on your model. Now you just need to add `.activated()` instead of `.where({activated: true})` to your search.

```js
User.activated().join()...
```

Scopes are synchronous only and will provide automatic [chainability](#chaining) for you!


{{Definition.scope()}}

{{Definition.defaultScope()}}


## Custom Methods

Extending your model with custom methods is as easy as defining your method on the model definition scope:

```js
module.exports = function(){
	this.fullName = function(){
		return this.first_name + ' ' + this.last_name;	}
}
```

now you could call `fullName()` on your record like this:

```js
var phil = new User({
	first_name: 'Philipp',
	last_name: 'Waldmann'
});

console.log(phil.fullName()); //returns "Philipp Waldmann"
```


## Autojoin

OpenRecord gives your the option to define relations which will be joined automatically if needed. The relation will be joined if there is a condition targeting the related table.

```js
module.exports = function(){
	this.hasMany('permissions');
	this.autoJoin('permissions');
}
```

{{Definition.autoJoin()}}

## Chaining

You may have noticed that every definition method described above will return a `Definition`-Object. This Object is the the definition scope (`this`). So you are able to chain everything if you prefer it that way.

```js
module.exports = function(){
	this
	.validatesPresenceOf('name')
	.validatesConfirmationOf('password')
	
	.hasMany('posts')
	.hasMany('threads');
}
```

# Model

Use the [ready()](#ready) method to get notified when your model is ready for usage. To retrieve the model you could use the `Model()` as well.
Just do the following to get your Model:

```js
var User = store.Model('User');
```

If you've set the `global` config option to `true` OpenRecord automatically created a global variable with the same name as your model for you.

## Find/Get

OpenRecord has some really handy methods to search your store. To get the results call `exec()`

{{Model.exec()}}

To get a single record, call `find(id)`.

{{Model.find()}}

`get(id)` is very similar to get. The only difference is that `get(id)` will throw an error if no record was found.
  
{{Model.get()}}


## Conditions
	
OpenRecord has a realy nice syntax to filter your results.
There are 3 simple ways to write some conditions:

```js
User.where(['login = ?', 'phil']) //write raw sql placeholders
User.where(['login = :login', {login: 'phil'}]) //write raw sql with enhanced placeholders
User.where({login: 'phil'}) //conditions as a hash
```

But the hash syntax is even more powerful:

```js
User.where({login: ['phil', 'michl']}) //login IN ('phil', 'michl')
User.where({login: null}) //login IS NULL
User.where({active: true}) //active IS true
User.where({login_not: null}) //login IS NOT NULL
User.where({login_like: 'phi'}) //login LIKE '%phi%'
User.where({login_not_like: 'phi'}) //login NOT LIKE '%phi%'
User.where({login_like: ['phi', 'mic']}) //(login LIKE '%phi%' OR login LIKE '%mic%')
User.where({failed_logins_gt: 0}) //failed_logins > 0
User.where({failed_logins_gte: 0}) //failed_logins >= 0
User.where({failed_logins_lt: 10}) //failed_logins < 10
User.where({failed_logins_lte: 10}) //failed_logins <= 10
User.where({failed_logins_between: [5, 8]}) //failed_logins between 5 and 8
```

The above examples always relate to the `User` model, but what about relations?

```js
User.join('posts').where({posts:{title_like: ['OpenRecord']}}).exec(function(posts){
  console.log(posts); //returs all users with all posts where the title contains 'OpenRecord'
})
```

The conditions nesting could be done indefinitely!

```js
User.join({posts: {thread: 'rating'}}).where({posts: {thread: {rating: {stars_gte: 5}}}}).exec(function(posts){
  console.log(posts); //returs all users with all posts whith it's thread where the rating has more than 4 stars
})
```

{{Model.where()}}	

## Aggregate functions

OpenRecord has basic aggregate functions build in.

```js
User.count().where({active: true}).exec(function(count){
  console.log(count); //logs the number of active users
})
```

if you use multiple aggregate functions at once:

```js
User.count().sum('failed_logins').where({active: true}).exec(function(result){
  console.log(result.count); //logs the number of active users
  console.log(result.sum); //logs the sum of failed_logins
})
```

{{Model.count()}}

{{Model.sum()}}
	
{{Model.max()}}

{{Model.min()}}

## Joins

If you've properly set up your relations joining them is as easy as

```js
User.join('relation_name').exec(function(users){
  console.log(users[0].relation_name);
})
```

or 

```js
User.join('relation_name', 'another_relation', 'and_one_more')
```

or via

```js
User.join(['relation_name', 'another_relation', 'and_one_more'])
```

if you need to join nested relations use the hash syntax instead:

```js
User.join({posts: {thread: 'rating'}})
```

All joins are by default `LEFT JOIN`s.


{{Model.join()}}

{{Model.leftJoin()}}

{{Model.rightJoin()}}

{{Model.innerJoin()}}

{{Model.outerJoin()}}

## Includes

To prefetch/eagerload relations use the `include()` function.
OpenRecord will create an extra query for every included relation.
The syntax is similar to the `join()` method.

{{Model.include()}}

## Limit/Offset

Limit your results with `LIMIT` and `OFFSET`.

{{Model.limit()}}

{{Model.offset()}}

## Sorting

{{Model.order()}}

## Group/Having

{{Model.group()}}

`having()` acceptes the same params like the `where()` functions

{{Model.having()}}

## Select

By default OpenRecord will select all fields (`*`).
You could define some custom select fields - or SQL functions here.

{{Model.select()}}

## Context

{{Model.setContext()}}

## Json

{{Collection.toJson()}}

## Chaining

{{Model.chain()}}

## Collection

## Delete/Destroy

{{Model.delete()}}

{{Model.destroy()}}

# Record
## Attributes

{{Record.set()}}

{{Record.get()}}

Changes

{{Record.hasChanges()}}

{{Record.hasChanged()}}

{{Record.getChanges()}}

{{Record.getChangedValues()}}

{{Record.resetChanges()}}

Allowed attributes

## Validations

{{Record.validate()}}

Errors ... coming soon

## Relations

Nested records ... coming soon

## Json

{{Record.toJson()}}

## Create

{{Model.new()}}

{{Model.create()}}

{{Record.save()}}

## Update
Just change some attributes and OpenRecord will automatically detect the changed values.

```js
user.login = 'phil';
user.save(function(){
  // ...
}) 
```
## Destroy

{{Record.destroy()}}

### Cascade
Coming soon
## Transactions

{{Model.transaction()}}

# Migrations
Coming soon
# Plugins
Coming soon
## Internal Structure
Coming soon