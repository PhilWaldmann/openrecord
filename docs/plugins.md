
# Plugins

`plugins` are first class citizens in OPENRECORD, because everything in OPENRECORD is built that way.  

To use a plugin globally specify it via the `plugins` [store config](./setup.md).
```js
const store = new Store({
  type: 'sqlite3'
  file: './my-posts-db.sqlite3',
  plugins: [require('path/to/your/plugin')]
})
```

## Structure

A `plugin` is just an object with one or more of the following keys: 
* **store**: Add or change functionality of your store
* **definition**: Add or change functionality to the `definition scope` (all models!)
* **model**: Add or change functionality of your models (static methods)
* **record**: Add or change functionality of your records (of all models)
* **migration**: Add or change functionality of your [migrations](./migrations.md)

Let's take a look at the built in [paranoid](#paranoid) plugin:

```js
// ./plugins/paranoid.js
exports.migration = {
  /*
  add the `paranoid` method to the migrations object
  which will allow you to do the following inside your migration:

  this.createTable('users', function(){
    this.string('login', {not_null: true})
    this.string('first_name')
    this.string('last_name')
    this.paranoid()
  })

  which will add the `deleted_at` and `deleter_id` to your table
  */
  paranoid: function(){
    this.datetime('deleted_at')
    this.integer('deleter_id')
  }
}

exports.definition = {
  // add another `paranoid` method to the `definition scope`
  // whenn called, all records will be marked as deleted, and every query will add an `WHERE deleted_at IS NULL`.
  // plus it adds a scope `withDeleted` to get all records.  
  paranoid: function(){
    var self = this

    // the scope to get all records
    this.scope('withDeleted', function(){
      // `this` is the model
      this.setInternal('withDeleted', true) // `setInternal` and `getInternal` are helper to save intermediate state of chained commands
    })

    // before find hook
    this.beforeFind(function(){
      // `this` is the model
      var withDeleted = this.getInternal('withDeleted') || false

      if(!withDeleted && self.attributes.deleted_at){
        this.where({deleted_at: null})
      }
    })

    // overwrite the destroy method of the models records
    // only overwrite if we call `paranoid()` in the `definition scope`!
    this.destroy = function(options, callback){
      // `this` is the record
      this.deleted_at = new Date()
      return this.save(options, callback)
    }
  }
}
```

As you can see in the above example, the `paranoid` method of the `definition scope` dynamically adds a `scope` and `hook`, as well as overwrites a record method.  
If you want to overwrite an existin method, make sure you call `this.callParent(..args..)`. Or in case of the above example: Return the same result as the original method - a `Promise`.

There is one special method, similar to a class constructor: `mixinCallback`
`mixinCallback` will be called on creation of that part. e.g. for a `definition` it will be called when the definition object will be initialized.  
As an example the built in [totalCount](#totalcount) plugin:

```js
exports.definition = {
  mixinCallback: function(){
    var self = this

    this.scope('totalCount', function(){
      var key = self.primaryKeys[0]
      this // reset limit, offset and order
      .count(self.getName() + '.' + key, true)
      .limit()
      .offset()
      .order(null)
    })
  }
}
```

This time the `scope` will be created for every model!

## Custom operators

OPENRECORD has all [basic operators](./query.md#with-conditions) predefined.  
An `operator` is define on a [type](./definitoin.md#attributes) and will be available for all attributes of that type.

Here is an example on how to add your own operator:

```js
// the new operator is called `regexp`
store.addOperator('regexp', function(field, value, query, condition){
  query.where(field, '~', value.toString().replace(/(^\/|\/$)/g, '')) // naiv conversion of js regexpt to postgres regexp!
})
// and it will be appended to the `string` type
store.appendOperator('string', 'regexp')
```

Now it's possible to [query](./query.md#with-conditions) your datastore in the following way:
```js
User.where({login_regexp: /p.il/})
```


Here is another example:

```js
store.addOperator('length', {
  on: {
    // it will only accept values of type `number` ...
    number: function(field, value, query, condition){
      query.whereRaw(`char_length(${field}) = ?`, [value])
    },
    
    // ... and `array`.
    array: function(field, value, query, cond){
      query.whereRaw(`char_length(${field}) BETWEEN ? AND ?`, value.splice(0, 2)) // only take the first 2 elements of the array
    }
  }
})
store.appendOperator('string', 'length')
```

!> The examples above are for a *postgres* database

## Built in plugins

Stores of type *sqlite3*, *postgres*, *mysql* and *oracle* does have the following plugins automatically loaded:

### nestedSet()

Handles [nested sets](https://en.wikipedia.org/wiki/Nested_set_model) for you and provides usefull helpers.  

In your [migration](./migrations.md) call `this.nestedSet()` to autmatically create `lft`, `rgt`, `depth` and `parent_id` columns.  

In your `definition scope` call `this.nestedSet()` to automatically add:
* `hasMany('children')` relation
* `belongsTo('parent')` relation
* `byLevel` scope, which takes the `depth` as first argument
* `rootOnly` scope to query only root elements
* `withChildren` scope to include all direct child elements in your query
* `withAllChildren` scope to include all children (optional `depth` argument to limit your results)
* `moveToChildOf` record method which takes the `id` of the new parent element or the parent record itself


### paranoid()

Instead of removing a record from your store, it will only mark it as deleted.

In your [migration](./migrations.md) call `this.paranoid()` to autmatically create `deleted_at` and `deleter_id` columns.  

In your `definition scope` call `this.paranoid()` to activate soft deletion.  
Paranoid models will have a `withDeleted` scope to query all records.


### serialize(field[, serializer])

To automatically serialize and unserialize a given field.  
The `serializer` must provide a `parse(string)` and a `stringify(object)` method. The default serializer is `JSON`.

### sortedList(options)

Helper for sorted lists.

In your [migration](./migrations.md) call `this.sortedList()` to autmatically create a `position` column.

In your `definition scope` call `this.sortedList(options)` to activate.  
The `options` object could contain the following values:
* **scope**: `Array` of field names the list should be scoped to
* **insert**: Insert a new record at the `beginning` or `end`. (Default `end`)

### stampable()

Automatically adds the date of creation or last update to a record.  

In your [migration](./migrations.md) call `this.timestamp()` to autmatically create `created_at` and `updated_at` columns.  
Call `this.userstamp()` to autmatically create `creator_id` and `updater_id` columns.  
Call `this.stampable()` to autmatically all of them.  

In your `definition scope` call `this.stampable()` to activate.  
Call `getUserBy(fn)` on your store. `fn` will be called with the record as first argument. The return value of `fn` will be used into `creator_id` and/or `updater_id`.  

If you didn't specify a `getUserBy` function, it will search for `context.user.id` (See [Context](./context.md)). Otherwise the `creator_id` and `updater_id` will stay null.


### totalCount()

Adds a `scope` to get the amount of records, regardless of [joins](./query.md#join-other-tables) or defined limit and offsets.

This plugin is automatically activated and adds the `totalCount` scope to all your models.


# Optional Plugins

There are other plugins which are packaged but not loaded by default:

## GraphQL

See the section about [GraphQL](./graphql.md)

## Automatic Model Loading

To automatically load all models from a directory you could use the `dynamic_loading` plugin located in `openrecord/lib/base/dynamic_loading`

!> You need to install the [glob](https://www.npmjs.com/package/glob) package as well!

```js
const store = new Store({
  // ... your connection config
  plugins: [require('openrecord/lib/base/dynamic_loading')],
  models: './models/*'
})
```

This plugin allows you to define a `glob` pattern and OPENRECORD will load all matching files for you.  
Works for `migrations` as well!

!> Will not work with webpack or any other bundler!!