# Bundle your store with Webpack

If you are using *sqlite3*, *postgres*, *mysql* and *oracle* OPENRECORD will automatically load all models and its attribute definitions from your database (If `autoLoad` or `autoAttributes` is active).
To avoid this overhead (e.g. in a [serverless](https://serverless.com/) environment), you can use [webpack](https://webpack.js.org/) and the OPENRECORD webpack plugin to build your code with cached model and attribute definitions.

In your [webpack config]() add the following plugin:

```js
const OpenrecordCache = require('openrecord/webpack')
const myStore = require('./store.js')

module.exports = {
  // ... your webpack config
  plugins: [
    new OpenrecordCache(myStore)
    // ... other webpack plugins
  ]
}
```

The plugin constructor takes your store as its only input. 
So you have to `export` your store. e.g.

```js
// ./store.js
const Store = require('openrecord')
const store = new Store({
  //... your store config
})

module.exports = store
```

!> This plugin wont work in [watch](https://webpack.js.org/configuration/watch/) mode!

Your store will be initialized on build, so make sure a connection to your database could be established.  
After the store is ready, it will take the model and attribute definition and write it into a cache. This cache will be bundled with your source and automatically used.  
So your bundled store will be faster at start, because it won't query your database for schema information.