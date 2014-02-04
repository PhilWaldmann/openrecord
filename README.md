OpenRecord
==========

[![Build Status](http://travis-ci.org/PhilWaldmann/openrecord.png)](https://travis-ci.org/PhilWaldmann/openrecord)
[![Node.ci](http://node.ci/report/github/PhilWaldmann/openrecord/master.png)]
(http://node.ci/projects/github/PhilWaldmann/openrecord/master)
[![Coverage Status](http://coveralls.io/repos/PhilWaldmann/openrecord/badge.png)](https://coveralls.io/r/PhilWaldmann/openrecord)
[![npm package version](http://badge.fury.io/js/openrecord.png)](https://npmjs.org/package/openrecord)
[![Dependency Status](http://david-dm.org/PhilWaldmann/openrecord.png)](https://david-dm.org/PhilWaldmann/openrecord)

> ActiveRecord like ORM for nodejs


## Installation

```bash
npm install openrecord
```


## Features

* Async schema definition
* Automatic field definition loading
* Relations
* Nested Eager loading
* Validations
* Scopes
* Before and after hooks
* Events
* Chaining
* ...


## Roadmap

#### 0.2.0
* ~~Base Documentation~~
* ~~finish base sql methods~~

#### 0.3.0
* Better error handling
* ~~sql unit tests~~

#### 0.4.0
* basic postgres support
* migrations

#### 0.5.0
* add mysql support
* full multiple primary keys support

#### 0.6.0
* finish .every() callback issues
* better postgres support (hstore, ect.)

#### 0.7.0
* custom plugin support


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


## [Documentation](http://philwaldmann.github.io/openrecord/)


## Contributing

If you've found a bug please report it via the [issues](https://github.com/PhilWaldmann/openrecord/issues) page. Please make sure to add a unit test with the bug report!
Before submit pull request make sure all tests still passed. 
