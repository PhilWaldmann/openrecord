![OpenRecord](docs/logo.png)
==========

[![Build Status](https://travis-ci.org/PhilWaldmann/openrecord.svg?branch=master)](https://travis-ci.org/PhilWaldmann/openrecord)
[![Coverage Status](http://coveralls.io/repos/PhilWaldmann/openrecord/badge.png)](https://coveralls.io/r/PhilWaldmann/openrecord)
[![npm package version](http://badge.fury.io/js/openrecord.png)](https://npmjs.org/package/openrecord)
[![Package Quality](http://npm.packagequality.com/shield/openrecord.svg)](http://packagequality.com/#?package=openrecord)
[![Code Quality: Javascript](https://img.shields.io/lgtm/grade/javascript/g/PhilWaldmann/openrecord.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/PhilWaldmann/openrecord)
[![Total Alerts](https://img.shields.io/lgtm/alerts/g/PhilWaldmann/openrecord.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/PhilWaldmann/openrecord/alerts)

OPENRECORD is an ActiveRecord inspired ORM for nodejs.

Currently it supports the following databases/datastores: SQLite3, MySQL, Postgres, Oracle, REST and LDAP (+ ActiveDirectory)  
If you want to build a GraphQL endpoint for any of these databases, OPENRECORD has some built in features to support you!

As the name imply, it's open and very easy to extend. The whole package was build that way.

It has a lot of features, just take a look at the [docs](https://openrecord.js.org)!

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
Take a look at the [docs](https://openrecord.js.org) to get started!

## Contributing

If you've found a bug please report it via the [issues](https://github.com/PhilWaldmann/openrecord/issues) page.  
Before you submit a pull request, please make sure all tests still pass.

---

Sponsored by [digitalbits.at](https://digitalbits.at)
