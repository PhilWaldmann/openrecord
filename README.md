![OpenRecord](logo.png)
==========

[![Build Status](https://travis-ci.org/PhilWaldmann/openrecord.svg?branch=master)](https://travis-ci.org/PhilWaldmann/openrecord)
[![Coverage Status](http://coveralls.io/repos/PhilWaldmann/openrecord/badge.png)](https://coveralls.io/r/PhilWaldmann/openrecord)
[![npm package version](http://badge.fury.io/js/openrecord.png)](https://npmjs.org/package/openrecord)
[![Dependency Status](https://gemnasium.com/PhilWaldmann/openrecord.svg)](https://gemnasium.com/PhilWaldmann/openrecord)

> Make ORMs great again!

**Docs are for v2.0 - currently available with tag `next` on npm**

OPENRECORD is an ActiveRecord inspired ORM for nodejs.

Currently it supports the following databases/datastores: SQLite3, MySQL, Postgres, Oracle, REST and LDAP (+ ActiveDirectory)  
If you want to build a GraphQL endpoint for any of these databases, OPENRECORD has some build in features to support you!

As the name imply, OPENRECORD is very easy to extend. The whole project was build that way.

OPENRECORD has a lot of features, just take a look at the [docs](https://philwaldmann.github.io/openrecord)!

## Usage example

Here is an example how to get a single `post` from an existing sqlite3 file (by primary key).
```js
const Store = require('openrecord/store/sqlite3')

const store = new Store({
  file: './my-posts-db.sqlite3',
  autoLoad: true
})

store.ready(async () => {
  const post = await store.Model('Post').find(1)
  console.log(post)
})
```

You don't have to define your model (optional) and you also don't have to define your model's attributes (optional).  
Take a look at the [docs](https://philwaldmann.github.io/openrecord) to get started!

## Contributing

If you've found a bug please report it via the [issues](https://github.com/PhilWaldmann/openrecord/issues) page. Please make sure to add a unit test with the bug report!
Before submit pull request make sure all tests still passed.
