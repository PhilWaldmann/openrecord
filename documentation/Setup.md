## Sqlite3
```js
var OpenRecord = require('openrecord');

var store = new OpenRecord({
  type: 'sqlite3',
  file: 'test.sqlite'
});
```

## Postgres
```js
var OpenRecord = require('openrecord');

var store = new OpenRecord({
  type: 'postgres',
  host: 'localhost',
  database: 'mydb',
  username: 'myuser',
  password: 'mypass'
});
```

## MySQL
```js
var OpenRecord = require('openrecord');

var store = new OpenRecord({
  type: 'postgres',
  host: 'localhost',
  database: 'mydb',
  username: 'myuser',
  password: 'mypass'
});
```