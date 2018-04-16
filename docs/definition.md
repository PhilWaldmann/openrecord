# Model Definition

OPENRECORD allows you to define your models in multiple ways.  
The easiest and quickest way is to let OPENRECORD define your models for you. Use the `autoLoad` config like in the [setup example](setup.md).  
  
An OPENRECORD model, in contrast to a typical OOP class, consists of 3 parts:
1. static methods (e.g. `find`, `sort`, `deleteAll`, ...)
2. instance methods (e.g. `save`, `delete`, ...)
3. definition methods (e.g. `validatedPresenceOf`, `hasMany`, `isParanoid`, ...)

Definition methods are only available in the `definition scope`!  
Let's see some examples:

To use [validations](#validations), [relations](#relations), [scopes](#scopes), custom methods and other helpers, you need the `definition scope`.  
For small projects you could to this in the same file as your store initialisation:

```js
const Store = require('openrecord/store/sqlite3')

const store = new Store({
  file: './my-users-db.sqlite3'
})

store.Model('User', function(){
  // this is the `definition scope`
  this.validatesPresenceOf('first_name', 'last_name')
  this.fullName = function(){
    return this.first_name + ' ' + this.last_name
  }
})

store.ready(async () => {
  const user = await store.Model('User').find(1)
  console.log(user.fullName())
})
```

?> You could use the `autoLoad` config in parallel with your model definition!

Instead of a function you could also provide a class:
```js
class User extends Store.BaseModel{
  static definition(){
    // this is the `definition scope`
    this.validatesPresenceOf('first_name', 'last_name')
  }

  fullName(){
    return this.first_name + ' ' + this.last_name
  }
}
store.Model(User)

store.ready(async () => {
  const user = await User.find(1)
  console.log(user.fullName())
})
```

For a big project you want to create one file per model (or multiple files per model, see [Mixins](#mixins))
```js
// store.js
const Store = require('openrecord/store/sqlite3')

const store = new Store({
  file: './my-users-db.sqlite3',
  models: [
    require('./models/User.js')
  ]
})
```

```js
// models/User.js
const Store = require('openrecord/store/sqlite3')

class User extends Store.BaseModel{
  static definition(){
    // this is the `definition scope`
    this.validatesPresenceOf('first_name', 'last_name')
  }

  fullName(){
    return this.first_name + ' ' + this.last_name
  }
}

module.exports = User
```

?> You could also return a `function` like in the first example. The function name (e.g. `function User(){...}`) will be used as the model name!

As you can see in the above examples, the difference between `class` and `function` style is the way you define your custom methods.  
Internally OPENRECORD will work the same!

The scope of the `class` style `definition` method and the `function` style method are the same. That's the `definition scope`.  
Every model has an internal definition which connects to the store, contains [validations](#validations), [relations](#relations) and more.
The definition actually creates your model, or in case of a `class`, enhances it.
There is also the possibility to create multiple [temporary definitions](#temporary-definition) for a single model  

The following methods are available in the `definition scope`:

## Validations

In order to validate your records on `save()` (See [Modify](./modify.md)), you have to first define your validation rules.  

The most powerful is custom validation via `validates()`, which could return a `Promise`, nothing or throw an `Error`.  

### validates(fn)
Add a custom validator function to your records

```js
this.validates(function(){
  // `this` is the record
  if(this.shouldNotBeOne === 1){
    this.errors.add('shouldNotBeOne', "can't be 1")
  }
})
```

Every record has an `errors` object attached, where you could add your validation errors with `errors.add()`. This will automatically `throw` after all validation rules finished.  

The `errors` object is of type `ValidationError` and inherits from `Error`. See [Modify](./modify.md) for further usage details.  
The `add` method could be used as illustrated in the above example (`.add(fieldName, errorMsg)`) or without the `fieldName` argument (`.add(errorMsg)`) wich will represent a general validation error.  

Of cours you could throw your own `Error` as well! But be aware, that throwing an Error directly will stop all other validation rules.

?> The value of a fulfilled `Promise` will be ignored.


OPENRECORD has a lot of built in validation methods and could be [extended easily](#plugins).  
Stores that automatically load and define your attributes (*sqlite3*, *postgres*, *mysql* and *oracle*) also automatically apply certain validations based on e.g. `NOT NULL` or `varchar(255)`.

The following validation methods are available for every store type:

### validatesPresenceOf(fields ...)
This validator checks the given field's value to be not null.  
The `fields` argument could be a `String` or an `Array` of field names

```js
this.validatesPresenceOf('my_attr', 'my_attr2')
```


### validatesConfirmationOf(fields ...)
This validator checks if the given field`s value and <field_name>_confirmation are the same.

```js
this.validatesConfirmationOf('password')
```


### validatesFormatOf(fields, format[, options])
This validator checks the format of one or multiple fields.
Valid `format` types are:
* `email`
* `url`
* `ip`
* `uuid`
* `date` 
* null
* Regular expression

The `options` argument could be set to `{allow_null: true}` to ignore `null` values.

```js
this.validatesFormatOf('my_email', 'email')
```


### validatesLengthOf(field, length)
This validator checks if the given field's values length is less than or equal `length`.

### validatesNumericalityOf(field, options)
This validator could be used to check numerical values.  
The `options` object could contain the following:

* `allow_null`: Skip validation if value is null (`Boolean`)
* `eq`: value needs to be equal than that number (`Number`)
* `gt`: value needs to be greater than that number (`Number`)
* `gte`: value needs to be greater than that number (`Number`)
* `lt`: value needs to be lower than that number (`Number`)
* `lte`: value needs to be lower than or equal that number (`Number`)
* `even`: value needs to be even (`Boolean`)
* `off`: value needs to be odd (`Boolean`)

### validatesInclusionOf(fields, allowedValues)
This validator checks if a field's value is contained in the `allowedValues` array. E.g. so simulate enums.

```js
this.validatesInclusionOf('role', ['admin', 'moderator', 'user'])
```

?> If you use *postgres* enums, it will automatically detect it and adds the `validatesInclusionOf` validation


### validatesUniquenessOf(fields[, options])
!> *sqlite3*, *postgres*, *mysql* and *oracle* only!  

This validator checks the uniqness of the given field's value before save.  
Be aware that this validation will query your database on every `save`! It's better to use your database for checks like that.

The `options` argument could be set to `{scope: 'field_name'}` to specify that the field is uniq for every record with the same `field_name` value.  
`scope` could also be an array.

```js
this.validatesUniquenessOf('teacher_id', {scope: ['semester_id', 'class_id']})
```

## Relations

OPENRECORD supports `belongs to`, `has many`, `has one` and `belongs to many` relations as well has `has many through`, `belongs to through` and `polymorphic` relations.

A relation - except for a polymorphic relations - always needs a target model. The model name will be automatically taken from the relation name. If needed, you could always define the model name via the `model` config option.

The relation will be initialized after the target model is ready - to automatically get the primary and foreign key. The default for the foreign key is `<model_name>_<primary_key>` - all lower case! You could manually set the `from` and `to` key, if you need.

The `name` of the relation is a string and could be anything you like. If you use the plural or singular version of an existing model name, OPENRECORD will automatically detect it and will set most of the options for you.  
The `options` parameter is optional, if it can autodetect your target model. Otherwise you need to privide an object with the following config options:
* **model**: The target model name as a string
* **store**: Optional store `name`. Only needed for cross store relations!
* **from**: The name of the field of the current model 
* **to**: The name of the field of the target model
* **through**: The relation name of the current model you want to go through
* **relation**: The relation name of the target model. Use only in conjunction with `through`
* **as**: Set the `<polymorhic name>`. See `belongsToPolymorphic()`
* **conditions**: Optional `conditions` object (See [Query](./query.md#with-conditions))
* **scope**: Optional name of a [scope](./definition#scopes) of the target model
* **dependent**: What should happen with the related record after a record of this model will be deleted. Valid values are: `destroy`, `delete`, `nullify` or null. (Default null)
* **autoSave**: Automatically save loaded or new related records (See [save](./modify#save) and [setup](./setup.md))

### hasMany(name[, options])
The target model contains the primary key of this model

```js
// models/User.js
this.hasMany('posts', {to: 'author_id', autoSave: true})
```

### hasOne(name[, options])
The target model contains the primary key of this model, but only the first record is taken

### belongsTo(name[, options])
This model contains the primary key of the target model

```js
// models/Post.js
this.belongsTo('author', {model: 'User'})
```

### belongsToMany(name[, options])
This model contains an array of primary keys of the target model

```js
// models/User.js
this.belongsToMany('roles') // User has a `role_ids` field
```

### belongsToPolymorphic(name[, options])
This model contains an id and the model name of the target model.  
The `options` parameter takes additional attributes:
* **typeField**: The field which stores the target model name. Default: `'<name>_type'`
* **idField**: The field which stores the target model id. Default: `'<name>_id'`
* **storeField**: Optional store `name`. Only needed for cross store relations!. Default: The current store
```js
// models/User.js
this.belongsToPolymorphic('children', {typeField: 'children_class'}) // if we have a model with a `children_class` and `children_id` fields
```


## Scopes

Scopes are a way to predefine conditions or add other functionality to your models.  
Here is an example:

```js
this.scope('active', function(){
	this.where({active: true})
})
```

The above scope definition will add a static `active` method to your model.  
This could be used for [queries](./query.md) or [mutations](./modify.md):

```js
const user = await User.active().limit(10)
```

### scope(name[, fn, lazy])

A `scope` is basically a static model method, which supports [chaining](./query.md#chaining).
But a `scope` function could also be *lazy*, which means it won't be executed immediately. That allows it to be asynchronous, if needed (just return a `Promise`).  
It takes arguments like any other method, but the return value (unless it's a `Promise`) will be ignored.

If your models are defined as a `class`, you could to the following to convert your normal method to a `scope` method.  
The original method will be overwritten!

```js
class User extends store.BaseModel{
  static definition(){      
    this.scope('active')
  }

  static active(){
    this.where({active: true})
  }
}
```

If your scope should be *lazy*, set the last argument `lazy` to true


### defaultScope(name)
If you want a scope to be used automatically, set it as a default via `this.defaultScope('active')`



## Attributes

Until this point we've talked about fields or attributes, but not how to define them.
For *sqlite3*, *postgres*, *mysql* and *oracle* stores you dont need to, because they are loaded automatically from your store. But this does not work for *ldap* or *rest* stores.

?> even if you are using a store with automatic field detection, you could always add a new ones!

Only attributes that are defined will be used from your datastore. To define an attributes use the `attribute(name, type[, options])` method.

### attribute(name, type[, options])

Adds a new attribute to the model definition. The `type` could be any of the standard javascrip types: `Number`, `String`, `Date`, `Boolean`, `Array`, `Object` or `Buffer`. These types are available for every store.  
For all SQL stores (*sqlite3*, *postgres*, *mysql* and *oracle*) there are additional types available: `'binary'`, `'boolean'`, `'date'`, `'datetime'`, `'float'`, `'integer'`, `'string'`, `'time'` which translate to the corresponding types of your database.  
The *postgres* store also contains some additional types: `'hstore'`, `'interval'`, `'json'`, `'uuid'`

To add a new attribute just write:
```js
this.attribute('my_attribute', String)
```

!> Be aware, that this will **not** change your database schema!

The above attribute `my_attribute` will be available for setting and getting a value. It will automatically convert the input to a `String`. But it won't save it to a SQL store!

The `attribute` methods takes a third `options` argument object with the following values:
* **writable**: Make the attribute writable (e.g. `record.my_attribute = 'foo'`). Default true
* **readable**: Make the attribute readable (e.g. `record.my_attribute`). Default true
* **default**: Add a default value
* **track_object_changes**: Track changes of a nested object. For objects only

### setter(name, fn)
Instead of defining an attribute, you could also define just a setter.

```js
this.setter('email', function(email){
  this.login = email.toLowerCase()
})
```

### getter(name, fn)
Or define just a getter

```js
this.getter('full_name', function(){
  return `${this.first_name} ${this.last_name}`
})
```

## Type Conversion
Sometimes you need to convert your field from the internal structure of you datastore to another format.  
OPENRECORD has 4 types of conversions: `read`, `write`, `input` and `ouput`.

The `read` converter will be used to convert the raw ouput of your datastore to the internal value of your record. Vice versa `write` will convert the internal value to the value of your data store.  
E.g. a date could be stored as a timestamp in your datastore and provided by the record as a native `Date` object.  

The `input` converter will be used every time you set a new value to a records field (e.g. `this.my_attribute = 'foo'`) and the `output` converter will be used every time you get a value or `JSON.stringify` your records.

?> Every [attribute type](#attributes) has its own conversion methods predefined (e.g. `'datetime'`).

If you want to overwrite it, there are 4 methods to do so: `convertWrite`, `convertRead`, `convertInput`, `convertOutput`.  
Here is an example:

```js
this.convertOutput('my_float', function(value){
  return value > 10.0 ? 'BIG' : 'SMALL'
}, false)
```

The above example will output either `SMALL` or `BIG` if you do a `console.log(record.my_float)`. Where `my_float` is a numeric value in your datastore.

### convertWrite(field, fn[, forceType])

Will be used every time the value of your `field` will written to your datastore.

`fn` must be a function which receives the internal `value` as its first argument. The functions return value will be used.  
`this` is the record  
If `forceType` is set to `false`, the returned value won't be converted to the original type (see example above).

### convertRead(field, fn[, forceType])

Will be used every time we get a value from your datastore.

`fn` must be a function which receives the original `value` as its first argument. The functions return value will be used.  
`this` is the record  
If `forceType` is set to `false`, the returned value won't be converted to the original type (see example above).

### convertInput(field, fn[, forceType])

Will be used every time your `field` will be changed. e.g. via `record.my_attribute = 'foo'` or `record.set({my_attribute: 'foo'})`

`fn` must be a function which receives the new `value` as its first argument. The functions return value will be used.  
`this` is the record  
If `forceType` is set to `false`, the returned value won't be converted to the original type (see example above).

### convertOutput(field, fn[, forceType])

Will be used every time your `field` will be accessed. e.g. via `record.my_attribute` or `JSON.stringify(record)`

`fn` must be a function which receives the internal `value` as its first argument. The functions return value will be used.  
`this` is the record  
If `forceType` is set to `false`, the returned value won't be converted to the original type (see example above).


## Hooks

OPENRECORD provides hooks to intercept almost every bit of querying or modifying records.  
In fact, almost all of OPENRECORDs internals are build on top of these hooks.

?> A hook can be asynchronous if you return a `Promise`.

For example, if you want to always find records that are not deleted. (Although it's better to use the [paranoid Plugin](#paranoid))
```js
this.beforeFind(function(){
  this.where({delete_at: null})
})
```

The following hooks are available:

### beforeFind(fn)
Will be called before querying your data store.

`fn` will receive the [knex.js query builder](http://knexjs.org/#Builder) (*sqlite3*, *postgres*, *mysql* and *oracle*) or an `options` object (*ldap*, *rest*, ...)  
`this` is the model


### afterFind(fn)
Will be called after querying your data store.

`fn` will receive an `data` object, where `data.result` contains the resulting records  
`this` is the model


### beforeValidation(fn)
Will be called before a validation. e.g. `record.save()`

`this` is the record


### afterValidation(fn)
Will be called after a successfull validation.

`this` is the record


### beforeSave(fn)
Will be called before every create or update.

`fn` will receive the record and an `options` object. There you'll find the `options.transaction` [knex.js transaction](http://knexjs.org/#Transactions) (*sqlite3*, *postgres*, *mysql* and *oracle*)  
`this` is the record


### afterSave(fn)
Will be called after every create or update.

`fn` will receive the record and an `options` object. There you'll find the `options.transaction` [knex.js transaction](http://knexjs.org/#Transactions) (*sqlite3*, *postgres*, *mysql* and *oracle*)  
`this` is the record


### beforeCreate(fn)
Will be called before every create.

`fn` will receive the record and an `options` object. There you'll find the `options.transaction` [knex.js transaction](http://knexjs.org/#Transactions) (*sqlite3*, *postgres*, *mysql* and *oracle*)  
`this` is the record


### afterCreate(fn)
Will be called after every create.

`fn` will receive the record and an `options` object. There you'll find the `options.transaction` [knex.js transaction](http://knexjs.org/#Transactions) (*sqlite3*, *postgres*, *mysql* and *oracle*)  
`this` is the record


### beforeUpdate(fn)
Will be called before every update.

`fn` will receive the record and an `options` object. There you'll find the `options.transaction` [knex.js transaction](http://knexjs.org/#Transactions) (*sqlite3*, *postgres*, *mysql* and *oracle*)  
`this` is the record


### afterUpdate(fn)
Will be called after every update.

`fn` will receive the record and an `options` object. There you'll find the `options.transaction` [knex.js transaction](http://knexjs.org/#Transactions) (*sqlite3*, *postgres*, *mysql* and *oracle*)  
`this` is the record


### beforeDestroy(fn)
Will be called before every destroy.

`fn` will receive the record and an `options` object. There you'll find the `options.transaction` [knex.js transaction](http://knexjs.org/#Transactions) (*sqlite3*, *postgres*, *mysql* and *oracle*)  
`this` is the record


### afterDestroy(fn)
Will be called after every destroy.

`fn` will receive the record and an `options` object. There you'll find the `options.transaction` [knex.js transaction](http://knexjs.org/#Transactions) (*sqlite3*, *postgres*, *mysql* and *oracle*)  
`this` is the record




## Mixins

`mixins` are a great way split your model definition into multiple files or reuse parts of it.  
The easiest way to define a `mixin` is to just create a function, which will receive the `definition scope`, and use the `mixin()` method.

```js
// shared/user_id_required.js
module.exports = function(){
  this.validatesPresenceOf('user_id')
}
```

```js
// models/User.js
module.exports = function(){
  this.mixin(require('../shared/user_id_required'))
}
```

But the `mixin` method could also be used to load the `definition`, `model` and `record` part of a `plugin` (See [Plugins](./plugins.md)).


## Temporary definition

Sometimes you want to disable or add extra validation rules to your records. Or add hooks only for specific changes.  

As described at the beginning of this section, every model has a definition part. But the definition could be changed at runtime!  

Here is an example:
```js
this.scope('asUser', function(){
  this.temporaryDefinition()
  .validatesPresenceOf('role_id')
})
```

If you call for example `YourModel.asUser().create({...})` the `validatesPresenceOf` validation is active.  

The `temporaryDefinition` methods returns the new `definition scope`, but you could also provide a function `temporaryDefinition(fn)` whilch will be invoked with the `definition scope`.

Besides validation rules you could also add hooks, scopes, methods, attributes, conversions and everything else you could do in the `definition scope`.