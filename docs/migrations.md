# Write migrations with OPENRECORD
!> For **SQL** databases only!

Migrations are totally optional, but a nice addition to OPENRECORD.  
You write a migration the same way you would write a function style `model definiton`. The function will contain the `migration scope`:

```js
// ./migrations/20180307172543_create_users.js
module.exports = function(){
  this.createTable('users', function(){
    this.string('login', {not_null: true})
    this.string('first_name')
    this.string('last_name')
  })
}
```

The name of your migration file is up to you, but it's recommended to add a timestamp or simmilar to the name. Because every migration will run only once (if successfull).  
OPENRECORD will store all successfully finished migrations and wont execute them again! So if you want to add another field to your table, create a new migration:

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

Creates a new table. The `options` objecz is optional, valid values are: 
* **id** Set to `false` to disable the automatic creation of an `id` column with auto increment and primary key

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

The `table scope` has a method vor every [data type](./definition.md#attributename-type-options). The first argument hast to be the `name` of the column, the second is an optional `options` object. Valid `options` are:
* **primary**: Set to `true` for a primary key
* **unique**: Set to `true` to use a uniq constraint
* **default**: Set a default value
* **notnull**: Set a not null constraint

## renameTable(from, to)

Rename a table

## removeTable(table)

Remove a table

## addColumn(table, fn){

Adds one or multiple new columns to a table. `fn` provides the `table scope` like in `createTable(name, fn)`

## renameColumn(table, from, to){

To rename a column

## removeColumn(table, column){

To remove a column from a table

## polymorph(name)

Is a helper method in connection with [polymorphic relations](./definition.md#relations). It will create two fields for you:
```js
this.integer(name + '_id')
this.string(name + '_type')
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