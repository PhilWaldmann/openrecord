# Model definition

OpenRecord allows you to define your models in multiple ways.  
The easiest and quickest way is to let OpenRecord define your models for you. Use the `autoLoad` config like in the [setup example](setup.md).  
  
To use validations, relations, scopes, custom methods and other helper you need to define your model.  
For small projects you could to this in the same file as your store initialisation:

```js
const Store = require('openrecord/store/sqlite3')

const store = new Store({
  file: './my-users-db.sqlite3'
})

store.Model('User', function(){
  this.fullName = function(){
    return this.first_name + ' ' + this.last_name
  }
})

store.ready(async () => {
  const user = await store.Model('User').find(1)
  console.log(user.fullName())
})
```

?> You could use the `autoLoad` config in parallel with your model definition!

Instead of a function you could also provide a class:
```js
class User extends Store.BaseModel{
  fullName(){
    return this.first_name + ' ' + this.last_name
  }
}
store.Model(User)
```

For a big project you want to create one file per model (or multiple files per model, see [Mixins](#mixins))
```js
// store.js
const Store = require('openrecord/store/sqlite3')

const store = new Store({
  file: './my-users-db.sqlite3',
  models: [
    require('./models/User.js')
  ]
})
```

```js
// models/User.js
const Store = require('openrecord/store/sqlite3')

class User extends Store.BaseModel{
  fullName(){
    return this.first_name + ' ' + this.last_name
  }
}

module.exports = User
```

?> You could also return a `function` like in the first example. The function name (e.g. `function User(){...}`) will be used as the model name!






## Validation

## Relations

## Scopes

## Hooks

## Mixins

## Plugins

## Temporary definition
