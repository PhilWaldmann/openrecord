# Setup




```js
const Store = require('openrecord')

const store = new Store({
  type: 'sqlite3'
  file: './my-posts-db.sqlite3'
})

store.ready(async () => {
  const post = await store.Model('Post').find(1)
  console.log(post)
})
```

The `Store` constructor takes the following config parameter:
* `type`: Type of database or store you want to connect. Values are: `sqlite3`, `postgres`, `mysql`, `oracle`, `rest`, `ldap`, `activedirectory`
* `file`: SQLite3 only




# Require only what you need

OpenRecord supports different databases and backends.
If you are using e.g. `Postgres` only, it won't make any sense to load code for `ldap` or `rest` stores.
In order to avoid this useless memory overhead, you could `require` OpenRecord in the following way:

```js
const Store = require('openrecord/store/sqlite3')

const store = new Store({
  file: './my-posts-db.sqlite3'
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
