# Context

If you use OPENRECORD in a web application or similar, you most probably want to have access to some request information (e.g. the user session).  
Instead of calling a [scope](./definition#scopes) with this information it's better to use `setContext(context)`. OPENRECORD will provide you with the context everywhere you need it.  

Here is a very basic example:
```js
// ./models(Post)
module.exports = function(){
  this.beforeUpdate(function(){
    // here we use the `this.context`.
    // `this` is the record
    // check if the user is an admin or the creator of that post
    if(!this.context || (this.context.role !== 'admin' && this.context.id !== this.creator_id)){
      throw new Error('insufficient permissions')
    }
  })

  this.beforeFind(function(){
    // `this` is the model
    // `this.context` is also available    
  })
}
```

```js
var myContext = {role: 'admin', id: 1}

post = await Post.setContext(myContext).find(id)
post.title = 'OPENRECORD!!'
await post.save()
```

In the above example we call `setContext()` on the `Post` model, but the context object won't be set globally!  
It will instead only be available for all [hooks](./definition.md#hooks) involved in the initial find, and all corresponding records (the result)!
So if you do multiple queries, you have to use `setContext` for every new query:

```js
const [users, totalCount] = await Promise.all([
  User.limit(10).setContext(myContext),
  User.count().setContext(myContext)
])
```

If you are [reusing a query](./query.md#chaining) only one `setContext` is neccesary:
```js
const query = User.setContext(myContext)
const [users, totalCount] = await Promise.all([
  query.limit(10),
  query.clone().totalCount()
])
```
