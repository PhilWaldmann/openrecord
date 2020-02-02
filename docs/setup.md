# Setup

The easies way to get started is to point OPENRECORD to an exsting database.  
E.g. a [SQLite3](https://sqlite.org) database file:

```js
const Store = require('openrecord')

const store = new Store({
  type: 'sqlite3',
  file: './my-posts-db.sqlite3',
  autoLoad: true
})

store.ready(async () => {
  const post = await store.Model('Post').find(1)
  console.log(post)
})
```

?> The above example assumes that there is a `posts` table with a primary key field inside your `my-posts-db.sqlite3` file  


The `Store` constructor takes the following config parameter:
* **type**: Type of database or store you want to connect.  
  Values are: `sqlite3`, `postgres`, `mysql`, `oracle`, `rest`, `ldap`, `activedirectory`
* **file**: Path to the database file (*sqlite3* only)
* **host**: Hostname or IP of the server running your database (*postgres*, *mysql* and *oracle* only). _alias: hostname_
* **port**: The port your server is listening to (*postgres*, *mysql* and *oracle* only).
* **database**: The database name (*postgres*, *mysql* and *oracle* only)
* **user**: Username for your database (*postgres*, *mysql*, *oracle*, *ldap/activedirectory* only). _alias: username_
* **password**: Password for your database (*postgres*, *mysql*, *oracle*, *ldap/activedirectory* only)
* **url**: URL to your backend (*ldap/activedirectory* and *rest* only)
* **base**: The base DN of your ldap tree (*ldap/activedirectory* only)
* **socketPath**: The path to the unix socket (*mysql* only)
* **connection**: Set the connection object of [knex](https://knexjs.org/#Installation-client) directly. (*postgres*, *mysql*, *oracle*, *sqlite3* only)
* **version**: Set the database version if needed. (*postgres*, *mysql* only)
* **name**: The name of the store. Only needed if you use multiple stores and relations between them.
* **global**: Set to `true` if you want your Models defined in the [global scope](https://nodejs.org/api/globals.html) (not recommended).
* **globalPrefix**: Add a prefix to your model name (in combination with `global` only).
* **autoConnect**: Set to `false` if you don't want to connect to your database immediately (*sqlite3*, *postgres*, *mysql* and *oracle* only)
* **autoAttributes**: Set to `false` if you don't want to automatically define your model attributes via your database tables (*sqlite3*, *postgres*, *mysql* and *oracle* only)
* **autoLoad**: Set to `true` if you want all your models automatically created from your database tables (*sqlite3*, *postgres*, *mysql* and *oracle* only)  
  With a `postgres` database it will take the `public` schema by default to get your tables. If you want to change that, set `autoLoad` to the schema name instead of `true`.
* **autoSave**: Set the default value for `autoSave` on all [relations](./definition#relations)
* **inflection**: OPENRECORD will take your model name and pluralizes it to get e.g. the table name with the help of the [inflection](https://github.com/dreamerslab/node.inflection) module  
  If you want to overwrite certain names, pass an object with the format `{'wrong name': 'right name'}`.
* **externalAttributeName**: A function to convert field names into another format. e.g. from DB's snake_case to camelCase. The method takes a `string` and expects a `string` as return value.
* **internalAttributeName**: Similar to `externalAttributeName`, but for the reverse
* **plugins**: Array of plugins (See [Plugins](./plugins.md))
* **models**: Array of models (See [Definition](./definition.md#model-definition))
* **migrations**: Array of migrations (See [Migrations](./migrations.md))


# Require only what you need

OPENRECORD supports different databases and backends.
If you are using e.g. [Postgres](https://www.postgresql.org/) only, it won't make any sense to load code for `ldap` or `rest` stores.
In order to avoid this useless memory overhead, you could `require` OPENRECORD in the following way:

```js
const Store = require('openrecord/store/postgres')

const store = new Store({
  host: 'localhost',
  user: 'my-user',
  password: 'superSecret!',
  database: 'posts'
})
```

?> Additional benefit: You could omit the `type` parameter

The following paths are available:
* Postgres: `openrecord/store/postgres`
* Mysql: `openrecord/store/mysql`
* SQLite3: `openrecord/store/sqlite3`
* Oracle: `openrecord/store/oracle`
* REST `openrecord/store/rest`
* LDAP `openrecord/store/ldap`
* LDAP (Active Directory) `openrecord/store/activedirectory`

# Wait for the store to be ready!

In order to user your [models](./definition.md#model-definition) you need to wait for the store to be ready!
```js
await store.ready()
```

?> The store will load your model attributes from your datastore (if not cached) and build your model classes - or enhance them if you use the `class` syntax. 


If you specified `autoLoad: false` in your store config, you need to manually start a connection via 

```js
store.connect()
await store.ready()
```

?> `store.ready()` returns a `Promise`, so you could use `store.ready().then(...)` instead of `async/await` if you like.

# Close connection

calling `store.close(callback)` will close your database connection.

# Error Classes

openrecord has some error classes like `ValidationError` or `RecordNotFoundError`.
You can access them e.g. via `store.ValidationError`.  

Here is a list of all error classes:
* `UnknownAttributeError`: will be thrown if you use `variant()` for an unknown attribute.
* `UnknownAttributeTypeError`: will be thrown if define an `attribute()` with an unknown type.
* `MissingConvertFunctionError`: will be thrown if use the `convert()` function and didn't define a callback function.
* `UnknownConvertAttributeError`: will be thrown if use the `convert()` function and use an unknown attribute.
* `ValidationError`: will be thrown if use `save()` and your record is invalid.
* `RecordNotFoundError`: will be thrown if you use `get()` or `expectResult()` and no result was found.
* `UnknownInterceptorError`: will be thrown if you use `callInterceptors()` with an unknown interceptor.
* `NoCallbackError`: will be thrown if you use `validates()` without a callback function.
* `UnknownStoreTypeError`: will be thrown if create a store with an unknown store type.
* `SQLError`: will be thrown on any SQL error.

# Debug

OPENRECORD uses the [debug](https://github.com/visionmedia/debug) module. Just add `DEBUG=openrecord:*` to your env variables and you'll get debug information.
