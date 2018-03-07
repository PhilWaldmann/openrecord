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
const user = User.find(2)
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
OpenRecord will automatically [validate](#validate) your record and checks for [changes](#haschanges). It will only update your datastore if something has changed.  

```js
const user = User.find(2)
user.last_name = 'Waldmann'
await user.save()
await user.save() // will be ignored!
```

If you call `save()` it will also automatically check all loaded or new relations and save them as well

```js
const user = User.find(2)
user.posts.new({title: 'Awesome'})
await user.save() // will only create the new post
```

## updateAll(data)
!> *sqlite3*, *postgres*, *mysql* and *oracle* only!  


## hasChanges()

## getChanges()

## resetChanges()

## validate()


# Remove records

## delete()

## destroy()

## deleteAll()
!> *sqlite3*, *postgres*, *mysql* and *oracle* only!  


## destroyAll()
!> *sqlite3*, *postgres*, *mysql* and *oracle* only!  
