# Modify your data

To modify data you could either [load records](./query.md) or change multiple records at once.

But before you can start any operation you need to wait until the store is ready. To do so use the `store.ready()` method, which returns a `Promise` or accepts a callback as the first argument.  
All examples below will assume that the store is ready!

# Create new records

To create a new record you could either use `create()` or `new()` with `save()`

## create(data)
will automatically save the record to your datastore:

```js
// dont forget: await store.ready()

const user = await User.create({login: 'philipp'})
console.log(user.id)
```

To insert multiple records at once, you can call `create()` with an array of objects!

```js
const users = await User.create([
  {login: 'user1'},
  {login: 'user2'},
  {login: 'user3'}
])
console.log(users[0].id)
```

This will also work on relations!

```js
const User = await User.find(2)
await const post = user.posts.create({title: 'Awesome'})
console.log(posts) // e.g. {id: 1, user_id: 2, title: 'Awesome'}
```

## new([data])
with `new()` you can create a new record, but without immediately saving it to your datastore.
```js
const user = User.new({login: 'philipp'})
user.email = 'philipp@mail.com'

await user.save()
console.log(user.id)
```

`new` will be called for relations internally if you do the following

```js
const user = User.new({login: 'philipp', posts: [{title: 'More Awesome'}]})
console.log(user.posts)
```

which is equivalent to

```js
const user = User.new({login: 'philipp'})
user.posts.new({title: 'More Awesome'})
console.log(user.posts)
```

or

```js
const user = User.new({login: 'philipp'})
user.posts = Post.new({title: 'More Awesome'})
console.log(user.posts)
```

or

```js
const user = User.new({login: 'philipp'})
user.posts.add({title: 'More Awesome'})
console.log(user.posts)
```

or

```js
const user = User.new({login: 'philipp'})
user.posts = [{title: 'More Awesome'})]
console.log(user.posts)
```


?> With `autoSave` (see [relation defintion](./definition#relations)) `user.save()` will also save the `post` (all inside one transaction!)


# Change existing records

After you've [loaded an existing record](./query.md) you can modify it. (See [updateAll()](https://openrecord.js.org/#/modify?id=updatealldata) if you don't want to load it!)

```js
const user = await User.find(2)
user.last_name = 'Waldmann'
await user.save()
```

## set(data)

To set multiple fields at once, use `set(data)`:

```js
user.set({
  first_name: 'Philipp',
  last_name: 'Waldmann'
})
```

## relations

If you have for example a [belongs to](https://openrecord.js.org/#/definition?id=belongstoname-options) relation, you could change it on two ways.

```js
const user = await User.find(2).include('role')
// user.role === Role {id: 5, name: 'Normal User'}
// user.role_id === 5

// to remove the related record
user.role = null // will change: user.role_id === null
// or
user.role_id = null // will change: user.role === null

// to use another role
user.role = await Role.find(1) // will change: user.role_id === 1
// or
user.role_id = 1
await user.role

// to save all changes to your store
await user.save()
```

If you remove the relation (like in the above example) and have `{dependent: 'delete'}` (or `destroy`) set on this relation, it will automatically remove the related record from your store (on `user.save()`)

?> Dependent `delete` or `destroy` will also work if the relation is not loaded!!


A [has many](https://openrecord.js.org/#/definition?id=hasmanyname-options) relation behaves simmilar:

```js
const user = await User.find(2).include('posts')
// automatic attribute: user.post_ids

// to remove all related record
user.post_ids = []

// set related records via id
user.post_ids = [1, 5]

// remove second post
user.posts.remove(1)

user.posts.add(Post.new({title: 'Very awesome'}))
// or
user.posts.add({title: 'Very awesome'})
// or
user.posts.new({title: 'Very awesome'})

await user.save()
```

In this case it will automatically change multiple records if needed (set/remove `user_id` on `Post` records)  
This kind of API is available for every type of relation.

!> If the `posts` relation from the above example is not loaded, it will always performa a "remove all" before adding the assigned records! So be carefull with the `depentend` option.

## save()

To save a record back to your datastore, just call `save()`.  
OPENRECORD will automatically [validate](#validate) your record and checks for [changes](#haschanges). It will only update your datastore if something has changed.  

```js
const user = await User.find(2)
user.last_name = 'Waldmann'
await user.save()
await user.save() // will be ignored!
```

If you call `save()` it will also automatically check all loaded or new relations and save them as well, if you have activated `autoSave` in your [relation defintion](./definition#relations)!

```js
const user = await User.find(2)
user.posts.new({title: 'Awesome'})
await user.save() // will only create the new post, because user has not changed!
```

`save([options])` will take an optional `options` object:

* `transaction`: save the record within the given transaction (See [transactions](#transactions))


## update(data)

Set multiple fields at once and also save the record. (just combines `set()` and `save()`)

```js
await user.update({
  first_name: 'Philipp',
  last_name: 'Waldmann'
})
```

`update(data [, options])` will take an optional `options` object as the second argument:

* `transaction`: save the record within the given transaction (See [transactions](#transactions))


## updateAll(data)
!> *sqlite3*, *postgres*, *mysql* and *oracle* only!  

Change records without loading them:

```js
await User.where({active: true}).updateAll({failed_login_count: 0})
```

You can use almost any [query](./query.md) method to filter your records.

!> Note, that no hooks will be executed!

`updateAll(data [, options])` will take an optional `options` object as the second argument:

* `transaction`: save the record within the given transaction (See [transactions](#transactions))

## hasChanges()

To manually check if a record has changes

```js
const user = await User.find(2)
user.last_name = 'Waldmann'
console.log(user.hasChanges()) // outputs `true`
```

## getChanges()

To get all changes

```js
const user = await User.find(2)
user.last_name = 'Waldmann'
console.log(user.getChanges()) // outputs `{last_name: ['Old Value', 'Waldmann']}`
```

## resetChanges()

Undo all unsaved changes.

```js
const user = await User.find(2)
user.last_name = 'Waldmann'
user.resetChanges()
console.log(user.hasChanges()) // outputs `false`
```

## isValid()

To manually validate a record

```js
const user = await User.find(2)
user.last_name = 'Waldmann'
const valid = await user.isValid()
console.log(valid) // outputs `true`
```


## isNewRecord

check if a record is new/persisted

```js
const user = await User.find(2)
console.log(user.isNewRecord) // outputs `false`
```


# Remove records

## destroy()

To remove a record from your datastore use `destroy()`

```js
const user = await User.find(2)
await user.destroy()
```

If you have set `dependent` on a [relation](./definition.md#relations), all relational records will be removed or nullified as well.

`destroy([options])` will take an optional `options` object as the second argument:

* `transaction`: save the record within the given transaction (See [transactions](#transactions))


## delete()
!> *sqlite3*, *postgres*, *mysql* and *oracle* only!  

Does basically the same as `destroy`, but won't call any hooks and does not remove `dependent` [relations](./definition.md#relations)

`delete([options])` will take an optional `options` object as the second argument:

* `transaction`: save the record within the given transaction (See [transactions](#transactions))


## destroyAll()
!> *sqlite3*, *postgres*, *mysql*, *oracle* and *ldap/activedirectory* only!  

The usage is similar to `updateAll`.

```js
await User.where({active: false}).destroyAll()
```

Internally OPENRECORD will load all records and call `destroy()` on each.  
So hooks are fired for every record!

`destroyAll([options])` will take an optional `options` object as the second argument:

* `transaction`: save the record within the given transaction (See [transactions](#transactions))


## deleteAll()
!> *sqlite3*, *postgres*, *mysql* and *oracle* only!  

It's the same as `destroyAll()` but without the initial record loading and without hooks and `dependent` [relations](./definition.md#relations).  
A single delete query will be executed on your database.

`deleteAll([options])` will take an optional `options` object as the second argument:

* `transaction`: save the record within the given transaction (See [transactions](#transactions))


# Transactions
!> *sqlite3*, *postgres*, *mysql* and *oracle* only!  

`startTransaction(callback)` will start a transaction.  
`useTransaction(transaction)` will inject the transaction object into the query.

```js
await store.startTransaction(trx => {
  return Promise.all([
    Model1.useTransaction(trx).create({ valid: 12 }),
    Model2.useTransaction(trx).create({ invalid: 'a validation error' })
  ])
})
```
