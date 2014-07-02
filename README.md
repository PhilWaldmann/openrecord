![OpenRecord](logo.png)
==========

[![Build Status](http://travis-ci.org/PhilWaldmann/openrecord.png)](https://travis-ci.org/PhilWaldmann/openrecord)
[![Coverage Status](http://coveralls.io/repos/PhilWaldmann/openrecord/badge.png)](https://coveralls.io/r/PhilWaldmann/openrecord)
[![npm package version](http://badge.fury.io/js/openrecord.png)](https://npmjs.org/package/openrecord)
[![Dependency Status](https://gemnasium.com/PhilWaldmann/openrecord.svg)](https://gemnasium.com/PhilWaldmann/openrecord)

> ActiveRecord like ORM for nodejs

There are currently a hand full of ORMs for nodejs available - but there is no one with a nice syntax similar to ActiveRecord (Ruby).
OpenRecord will change that!


## Installation

```bash
npm install openrecord
```

## [Documentation](https://github.com/PhilWaldmann/openrecord/wiki)

## Features

* SQLite3, MySQL, Postgres, REST support
* Async schema definition
* Automatic field definition loading (SQL)
* Relations (hasMany, hasOne, belongsTo with through, polymorph)
* Nested Cascade delete
* Nested Eager Loading
* Nested Creates
* Nested Updates
* Nested Joins
* Validations
* Scopes
* Before and After Hooks
* Events
* Chaining
* Promises
* Migrations
* Plugin support
* Build in plugins (stampable, paranoid, nested set)
* ... with almost 900 tests 



## Usage

```js
var OpenRecord = require('openrecord');

var sqlite = new OpenRecord({
  type: 'sqlite3',
  file: 'test.sqlite'
});


sqlite.Model('User', function(){
  this.hasMany('posts');
    
  this.scope('active', function(){
    this.where({active: true});
  });
});


sqlite.Model('Post', function(){
  this.belongsTo('user');
});


sql.ready(function(){
  var User = sql.Model('User');

  User.active().where({posts: {title_like:'openrecord' }}).include('posts').exec(function(records){
    console.log(records);
  });
});

```


## Contributing

If you've found a bug please report it via the [issues](https://github.com/PhilWaldmann/openrecord/issues) page. Please make sure to add a unit test with the bug report!
Before submit pull request make sure all tests still passed. 
