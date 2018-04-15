# Modify your data

To modify data you could either [load records](./query.md) or change multiple records at once.

# Create new records

To create a new record you could either use `create()` or `new()` with `save()`

## create(data)
will automatically save the record to your datastore:

```js
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

## new([data])
with `new()` you can create a new record, but without immediately saving it to your datastore.
```js
const user = User.new({login: 'philipp'})
user.email = 'philipp@mail.com'

await user.save()
console.log(user.id)
```

# Change existing records

After you've [loaded an existing record](./query.md) you can modify it.

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

It's also allowed to set a single field:

```js
user.set('first_name', 'Philipp')
```

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

## updateAll(data)
!> *sqlite3*, *postgres*, *mysql* and *oracle* only!  

Change records without loading them:

```js
await User.where({active: true}).updateAll({failed_login_count: 0})
```

You can use almost any [query](./query.md) method to filter your records.

!> Note, that no hooks will be executed!

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

# Remove records

## destroy()

To remove a record from your datastore use `destroy()`

```js
const user = await User.find(2)
await user.destroy()
```

If you have set `dependent` on a [relation](./definition.md#relations), all relational records will be removed or nullified as well.

## delete()
!> *sqlite3*, *postgres*, *mysql* and *oracle* only!  

Does basically the same as `destroy`, but won't call any hooks and does not remove `dependent` [relations](./definition.md#relations)

## destroyAll()
!> *sqlite3*, *postgres*, *mysql*, *oracle* and *ldap/activedirectory* only!  

The usage is similar to `updateAll`.

```js
await User.where({active: false}).destroyAll()
```

Internally OPENRECORD will load all records and call `destroy()` on each.  
So hooks are fired for every record!

## deleteAll()
!> *sqlite3*, *postgres*, *mysql* and *oracle* only!  

It's the same as `destroyAll()` but without the initial record loading and without hooks and `dependent` [relations](./definition.md#relations).  
A single delete query will be executed on your database.