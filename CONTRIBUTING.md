# Contributing to openrecord

* Make changes in the `/lib` directory, add a test to the `/test` directory and run `npm test`.
* Before sending a pull request for a feature or bug fix, be sure to have created tests.
* Use the same coding style as the rest of the codebase (see `.eslintrc.js`)
* All pull requests should be made to the `master` branch.


## Setup
You'll need at least one of the following databases/stores to get some tests working:
* Postgres
* Mysql
* SQLite3
* OpenLDAP
* ActiveDirectory

Clone the repository and install all dependencies via `npm install`!

Here are a few npm commands to get started:
* `npm test`: Run all available tests via mocha and should
* `npm run lint`: Runs eslint for all javascript files in the `/lib` and `/tests` folder
* `npm run format`: formatts all javascript files with prettier.
* `npm run coverage`: runs all tests and reports the test coverage via istanbul
* `npm run dev-docs`: runy docsify on port 4444


## Code structure

`/lib` contains 3 folders and 3 javascript files:
* `/lib/base`: All the base functionality independent from the store type
* `/lib/stores`: The code for all the specific store types
* `/lib/graphql`: The graphql support code
* `/lib/store.js`: The basic store class
* `/lib/definiton.js`: The basic definition class
* `/lib/utils.js`: The basic util functions

The store, definition, utils and model classes will be build based on the given store type on start.
Every file inside the `/lib/base` and `/lib/stores` folder will contain parts of the final classes.
See the docs to [plugins](https://openrecord.js.org/#/plugins).

There are different hooks/interceptors to change or add behaviour during initialisation, query or modify operations. These are defined via `addInterceptor()`. See e.g. [`/lib/base/interceptors.js`](https://github.com/PhilWaldmann/openrecord/blob/master/lib/base/interceptors.js#L44).


## Testing

By default all tests for SQLite3, Mysql and Postgres will run. If you only have a Postgres Database installed, you'll need to run only postgres tests via `npm test -- --grep Postgres`. (`--grep MySQL` for MySQL or `--grep SQLite3` for SQLite3)  
Tests for `ldap` and `rest` will run agains an internally started server on port 1389(`ldap`) and 8889 (`rest`).
These ports need to be free in order to run the tests!

### Postgres testing

It will use the default `postgres` user. See [the postgres test helper](https://github.com/PhilWaldmann/openrecord/blob/master/test/sql/postgres/__helper.js#L7).

### MySQL testing

It will use the default `root` user for the test setup. See [the mysql test helper](https://github.com/PhilWaldmann/openrecord/blob/master/test/sql/mysql/__helper.js#L6). All other tests will run with the `travis` user.

1. install the official mysql server for your system
2. create the `travis` user for our tests  
```bash
mysql -u root -p -e "CREATE USER 'travis'@'%' IDENTIFIED WITH 'mysql_native_password' BY '';";
mysql -u root -p -e "GRANT ALL PRIVILEGES ON *.* TO 'travis'@'%' WITH GRANT OPTION; FLUSH PRIVILEGES;"
```
3. alter the root user to allow the login without a password (for local development only!!!)
```bash
mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY '';
```


### SQLite3

It will create a new .sqlite file and removes it afterwards.

### ActiveDirectory

You'll need to specify the following ENV variables to start tests agains your ActiveDirectory:
* `AD_URL`: e.g. ldap://your.domain
* `AD_USER`: e.g. DOMAIN\\Administrator
* `AD_PASSWORD`
* `AD_BASE`: e.g. ou=test,dc=your,dc=domain
  
Only then it will run your tests. See [the activedirectory test helper](https://github.com/PhilWaldmann/openrecord/blob/master/test/ldap/client/activedirectory/__helper.js#L18).
All tests will run within the given `AD_BASE` path.
