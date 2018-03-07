# Bundle your store with Webpack

If you are using *sqlite3*, *postgres*, *mysql* and *oracle* OpenRecord will automatically load all models and it's attribute definitions from your database (If `autoLoad` or `autoAttributes` is active).
To avoid this overhead (e.g. in a [serverless](https://serverless.com/) environment), you can use [webpack](https://webpack.js.org/) and the OpenRecord webpack plugin to build your code with cacheed model and attribute definitions.

In your [webpack config]() add the following plugin:

```js
const OpenRecordCache = require('openrecord/webpack')
const myStore = require('./store.js')

module.exports = {
  // ... your webpack config
  plugins: [
    new OpenRecordCache(myStore)
    // ... other webpack plugins
  ]
}
```

The plugin constructor takes your store as it's only input. 
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
After the store is ready, it will take the model and attribute definition and writes it into a cache. This cache will be bundled with your source and automatically used.  
So your bundled store will be faster at start, because it wont query your database for schema information.