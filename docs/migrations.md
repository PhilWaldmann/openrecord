# Write migrations with OPENRECORD
!> For **SQL** databases only!

Migrations are totally optional, but a nice addition to OPENRECORD.  
You write a migration the same way you would write a function style `model definiton`. The function will contain the `migration scope`:

```js
// ./migrations/20180307172543_create_users.js
module.exports = function migration20180307172543(){
  this.createTable('users', function(){
    this.string('login', {not_null: true})
    this.string('first_name')
    this.string('last_name')
  })
}
```

!> Your migration function could be anonymouse, but be aware that OPENRECORD will create a hash based on the function body. This hash will be used to check if the migration was executed already. So if you change your migration after executing it, it will run a second time. So it's always better to give it a uniqe name. If you use the [Automatic Model Loading Plugin](./plugins.md#automatic-model-loading) it will take the filename!

The name of your migration file is up to you, but it's recommended to add a timestamp or similar to the name. Because every migration will run only once (if successfull).  
OPENRECORD will store all successfully finished migrations and won't execute them again! So if you want to add another field to your table, create a new migration:

```js
// ./migrations/20180307172711_add_email_to_users.js
module.exports = function(){
  this.addColumn('users', function(){
    this.string('email')
  })
}
```

In order to execute your migrations just add the `migrations` config to your store and start your application. OPENRECORD will run all missing migrations and starts the store afterwards.

```js
const store = new Store({
  // ... your config
  migrations: [
    require('./migrations/20180307172543_create_users.js'),
    require('./migrations/20180307172711_add_email_to_users.js')
  ]
})
```

?> If you don't want to `require` all migrations by hand. You could use the [Automatic Model Loading Plugin](./plugins.md#automatic-model-loading).

!> At the moment a rollback of migrations is not possible!

Available methods in the `migration scope` are:

## createTable(name, options, fn)

Creates a new table. The `options` object is optional, valid values are: 
* **id**: Set to `false` to disable the automatic creation of an `id` column with auto increment and primary key
* **comment**: Set a table comment (if supported by your database)

`fn` is a function which provides the `table scope`!
Within the `table scope` you can add columns to the table:

```js
this.createTable('users', function(){
  // `this` => `table scope`
  this.string('login', {unique: true})
  this.integer('failed_login_count', {default: 0})

  this.string('first_name')
  this.string('last_name')
  this.integer_array('role_ids') // Postgres only
  this.jsonb('config') // Postgres only
})
```

The `table scope` has a method vor every [data type](./definition.md#attributename-type-options). The first argument has to be the `name` of the column, the second is an optional `options` object. Valid `options` are:
* **primary**: Set to `true` for a primary key
* **unique**: Set to `true` to use a uniq constraint
* **default**: Set a default value
* **not_null**: **notnull** or **null**: Set a not null constraint
* **references**: Defines a foreign key for the given `table.fieldName` reference.
* **comment**: Set a field comment (if supported by your database)

### type(typeName, fieldName, options)

For custom types (e.g. [postgres enum](#enum))
```js
this.type('myCustomType', 'fieldname')
```

### enum(name, options)

!> *sqlite3*, *mysql* and *oracle* only! For Postgres see [postgres enum](#enum)  

Create a text field with constrains like an enum.
```js
this.enum('my_enum', {values: ['A', 'B', 'C']})
```

### polymorph(name)

Is a helper method in connection with [polymorphic relations](./definition.md#relations). It will create two fields for you:
```js
this.integer(name + '_id')
this.string(name + '_type')
```

### timestamp()

Is a helper method in connection with the [timestamp plugin](./plugins.md#stampable). It will create two fields for you:
```js
this.datetime('created_at', { comment: 'Time of insert', default: 'NOW()' })
this.datetime('updated_at', { comment: 'Time of last update', default: 'NOW()' })
```

### userstamp()

Is a helper method in connection with the [timestamp plugin](./plugins.md#stampable). It will create two fields for you:
```js
this.integer('creator_id', { comment: 'Identifier of the creator ' })
this.integer('updater_id', { comment: 'Identifier of the last modifier' })
```

### stampable()

Will call both of the above funtions
```js
this.timestamp()
this.userstamp()
```

## renameTable(from, to)

Rename a table

## removeTable(table)

Remove a table

## createIndex(table, columns, options)

create an index for one or multiple columns.  
The `options` object is optional. Valid `options` are:
* **name**: The name of the index
* **type**: The index type

## dropIndex(table, columns, options)

removes an index.  
The `options` object is optional. Valid `options` are:
* **name**: The name of the index

## createUniqueIndex(table, columns, options)

create an uniqe index.  
The `options` object is optional. Valid `options` are:
* **name**: The name of the index

## dropUniqueIndex(table, columns, options)

removes an uniqe index.  
The `options` object is optional. Valid `options` are:
* **name**: The name of the index

## addColumn(table, fn)

Adds one or multiple new columns to a table. `fn` provides the `table scope` like in `createTable(name, fn)`

## renameColumn(table, from, to)

To rename a column

## removeColumn(table, column)

To remove a column from a table

## enum(name, values)

!> *postgres* only!  

To create a new enum type.

```js
this.enum('my_type', ['A', 'B', 'C'])
this.createTable('foo', function(){
  this.type('my_type', 'bar')
})
```

## raw(SQL)

In cases where you need to execute raw sql queries

```js
this.raw('CREATE VIEW ...')
```

## seed(fn)

`fn` will be called after the all migrations were finished successfully and the store has started.  
So you could create records or query data.

```js
module.exports = function(){
  this.seed(function(store){
    var User = store.Model('User')
    return User.create({login: 'phil'})
  })
}
```
