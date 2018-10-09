# Query OPENRECORD Models

After you've [initialized your store](./setup.md) and [defined your models](./definition.md) you are ready to query your datastore.  

But before you can start any operation you need to wait until the store is ready. To do so use the `store.ready()` method, which returns a `Promise` or accepts a callback as the first argument.  
All examples below will assume that the store is ready.

!> The following examples are using `async/await`, but you could always use a promise-style `.then(callback)`

## Get a single record

To get a single record (by primary key) you have two methods: `find(id)` and `get(id)`.  
`find` will return `null` if it can't find data for the given `id`, `get` will throw a `RecordNotFoundError`.

```js
const user = await User.find(1)
```

If you have multiple primary keys per model you can do `find(<key1>, <key2>)`.  
To get a single record by non primary key use `where()` together with `first()`

```js
const user = await User.where({email: 'phil@mail.com'}).first()
```

`first` is an alias for `singleResult`

## Get multiple records

The `find` and `get` methods also accept an array of ids!

```js
const users = await User.get([1, 2, 3])
```

If you want to get all records, you simply do
```js
const users = await User
```

But in most cases you want to [filter](#with-conditions) or [limit](#limitoffset) your results.

## With Conditions

OPENRECORD has a really nice syntax to filter your results.

Here are some examples to filtern a SQL store:
```js
User.where({login: ['phil', 'michl']}) // login IN ('phil', 'michl')
User.where({login: null}) // login IS NULL
User.where({active: true}) // active IS true
User.where({login_not: null}) // login IS NOT NULL
User.where({login_like: 'phi'}) // login LIKE '%phi%'
User.where({login_not_like: 'phi'}) // login NOT LIKE '%phi%'
User.where({login_like: ['phi', 'mic']}) // (login LIKE '%phi%' OR login LIKE '%mic%')
User.where({failed_logins_gt: 0}) // failed_logins > 0
User.where({failed_logins_gte: 0}) // failed_logins >= 0
User.where({failed_logins_lt: 10}) // failed_logins < 10
User.where({failed_logins_lte: 10}) // failed_logins <= 10
User.where({failed_logins_between: [5, 8]}) // failed_logins between 5 and 8
```

OPENRECORD supports a lot of different `operators` like `not`, `gt` or `between` (separated from the field name by an underscore).  
Depending on the [attribute type](./definition.md#attributes), the `operator` and the actual value it will create (in this case) the conditions for the SQL query.

built in `operators` for SQL stores are: `not`, `gt`, `gte`, `lt`, `lte`, `between`, `like`, `ilike`  
*ldap* stores support only: `not`, `gt`, `gte`, `lt`, `lte`, `between`

?> Want to add your [own operators](./plugins.md#custom-operators)?

Here is an example how to filter an *postgres* database via a jsonb field:
```js
User.where({json_attr: {bar: 'test'}}) // json_attr->>'bar' = 'test'
```

An alternative to the above `hash` syntax is to write raw conditions:
```js
User.where(['login = ?', 'phil'])
User.where(['login = :login', {login: 'phil'}])
```

?> Of course you could call `where()` multiple times!


## Preloading relations

If you have [relations](./definition.md#relations) defined, here is an example how to use them:
```js
const threads = await Thread.where({sticky: true}).include('posts')
console.log(threads[0].posts)
```

The above example will load all sticky threads and all their posts.  
OPENRECORD will query your datastore only two times:
1. To get all sticky threads
2. To get all posts that belongs to the previously loaded threads

!> Accessing a relation via it's name (e.g. `threads[0].posts`) will always return a promise. If you have used `.include('posts')` the returned Promise from `threads[0].posts` is already resolved internally! So calling `threads[0].posts.then(...)` will resolve instantly.  
If you need, you can access the preloaded results directly by adding a underscore: `threads[0]._posts`


Imaging we have a model `Thread` which has many `posts` and an `author`. The `Post` model also has an `author` and the `Author` model has a relation to the `last_post`.   
We could use `include()` to preload these relations the following way:
```js
Thread.include(['posts', 'author'])
Thread.include({posts: {author: 'last_post'}})
// or both queries combined
Thread.include([{posts: {author: 'last_post'}}, 'author'])
```

Filtering these relations could be done with `where` as well.  
The following example loads all threads, but only posts where the title contains `OPENRECORD`
```js
Thread.include('posts').where({posts:{title_like: 'OPENRECORD'}})
```

Conditions and includes could be nested indefinitely!

```js
User.include({posts: {thread: 'rating'}}).where({posts: {thread: {rating: {stars_gte: 5}}}})
```

# Loading Relations

If you don't want to preload relations, you could always load relational records manually:
```js
const user = await User.find(1)
const posts = await user.posts
console.log(posts)
```

In case of the above example `user.posts` is an alias for `Posts.where({user_id: [1]})`. So you could add additional conditions, scopes ect.
In addition, the loaded `posts` will also be available via `user.posts`. Because `posts === user.posts`

If you have already preloaded a relation, you could always use the above code to load further filter relational records.

```js
const user = await User.find(1).include('posts')
const originalPosts = user.posts
const posts = await user.posts.where({title_like: 'Awesome'})
console.log(posts)
```

Now `user.posts` is still the same as `posts` but not the same as `originalPosts`!


## Join other tables
!> For **SQL** databases only!

[Includes](#preloading-relations) are a little bit like offline joins. To do real joins in your database you have to use `join()`.  
`join()` takes the same input as `include()` and will do an `INNER JOIN` by default.

The following example loads all threads and posts where one of its posts title contains `OPENRECORD`.
```js
Thread.join('posts').where({posts:{title_like: 'OPENRECORD'}})
```

There are also dedicated methods to do other types of joins: `leftJoin()`, `rightJoin()`, `innerJoin()` and `outerJoin()`.  

Like the `condition()` method, `join()` also supports a raw format:
```js
User.join('JOIN posts ON users.id = posts.author_id')
```

?> Conditions work the same way as with `include()`


## Aggregate functions
!> For **SQL** databases only!

Instead of returning a record, you could also use your model for aggregated results. For example:
```js
const activeUserCount = await User.where({active: true}).count()
```

To use multiple aggregate functions at once:

```js
const result = await User.count().sum('failed_logins')
console.log(result.count); // the number of users
console.log(result.sum); // the total sum of failed_logins
```

The following aggregate functions are available:

### count([field, distinct])
Count the number of records in your database

The optional `field` will do a `COUNT(<field name>)` instead of `COUNT(*)`  
Set `distinct` to `true`in order to do a `COUNT(DISTINCT(<field name>))`

### sum(field)
Calculates the sum of a certain `field`
	
### max(field)
Calculates the maximum value of a certain `field`

### min(field)
Calculates the minimum value of a certain `field`

### avg(field)
Calculates the average value of a certain `field`

## Sorting

Use `order(columns, desc)` or the alias `sort()` to sort your result.

### order(field, desc)
Sort your result based on a `field`. To sort in descending order, set `desc` to true.
`field` could also be an array of fields.

?> You could call `order()` multiple times, to sort via multiple fields.


## Limit/Offset

Of course you could use `limit(limit[, offset)` to limit your result.  
Or just `offset(offset)`.


## Group/Having
!> For **SQL** databases only!

SQLs `GROUP` and `HAVING` is also supported.  
Be aware that the result will be plain objects instead of records!

### group(field ...)

`field` could be a single field or an array of fields.

```js
Post.group('message').order('message')
```

### having(conditions)

`having()` acceptes the same arguments like the `where()` function!


## Select
!> For **SQL** databases only!

By default OPENRECORD will select all fields (`*`).
You could change that via the `select()` method.

### select(field ...)
Will only select the given fields.  
```js
const user = await User.find(1).select('login')
// only user.login will be populated. all the other field will be null
```

You could also write raw SQL code, but be aware that the result will be plain objects instead of records!


## Chaining

All the methods described above are chainable.  
Every time you call a method on your model (e.g. `User.find(1)`) it will return a clone of itself witch contains the temporary state (e.g. *find the user with id 1*). 
But only the first call will return a clone, all the following method calls on that clone will return the clone.

So it's allowed to do the following

```js
const query = User.limit(10)

if(filter){
  query.where({some_conditions: true})
}

const users = await query
```

Ideally you'll create a [scope](./definition.md#scopes) for that.

Sometimes you want to reuse a clone for different queries:
```js
const query = User.where({active: true})
const [users, totalCount] = await Promise.all([
  query.clone().limit(10),
  query.totalCount()
])
```

In the above example we use `clone()` to generate a new clone based on the previous temporary state.

## toJSON

Calling `result.toJSON()` will transform your record(s) to plain javascript objects (with all it's relations).  
Therefore `JSON.stringify(result)` is the same as `JSON.stringify(result.toJSON())`  
