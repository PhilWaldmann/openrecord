'use strict'
const Store = require('./store')

function OpenRecordCachePlugin(store) {
  this.store = store
}


class OpenRecordCacheInfusionDependency {
  constructor(range, value, store) {
    if(!Array.isArray(range)) throw new Error('range must be valid')
    this.range = range
    this.value = value
    this.store = store
  }

  // methods needed by webpack
  updateHash() {}

  getWarnings() {
    return null
  }

  getErrors() {
    return null
  }
}

OpenRecordCacheInfusionDependency.Template = class OpenRecordCacheInfusionDependencyTemplate {
  apply(dep, source) {
    const before = [dep.range[0], dep.range[1] - 1] // => `require` call
    const after = [dep.range[1] - 1 + dep.value.length + 5, dep.range[1] - 1 + dep.value.length + 5] // => the position after `require('openrecord....')``

    // create a new constructor, add the cache to the config and call the original constructor
    const beforeCode = [
      'function CacheInfusedStore(config){',
      'config = config || {}',
      'config.cache = ' + JSON.stringify(dep.store.cache) + ';',
      'return new '
    ].join('\n')
    const afterCode = ['(config)', '}'].join('\n')
    /*
    BECOMES:
    function CacheInfusedStore(config){
      config = config || {}
      config.cache = {...}
      return new __webpack_require(1)(config)
    }
    */

    source.replace(before[0], before[1], beforeCode)
    source.replace(after[0], after[1], afterCode)
  }
}




OpenRecordCachePlugin.prototype.apply = function(compiler) {
  var store = this.store
  if(!(store instanceof Store)) store = new Store(store)

  compiler.plugin('compilation', function(compilation, params) {
    compilation.dependencyFactories.set(OpenRecordCacheInfusionDependency, params.normalModuleFactory)
    compilation.dependencyTemplates.set(OpenRecordCacheInfusionDependency, new OpenRecordCacheInfusionDependency.Template())

    params.normalModuleFactory.plugin('parser', function(parser){
      // currently we search only for require calls
      parser.plugin('call require', function(node){
        // and check if 'openrecord' or 'openrecord/store/...' was required
        if(node.arguments[0] && node.arguments[0].value.match(/^openrecord($|\/store\/)/)){
          // now we do the fancy webpack dance
          const dep = new OpenRecordCacheInfusionDependency(node.callee.range, node.arguments[0].value, store)
          dep.loc = node.loc
          dep.request = node.arguments[0].value // actually I don't know where request comes, but it's the file name/relative path of the required file in webpack code
          parser.state.current.addDependency(dep)
        }
      })
    })
  })

  compiler.plugin('run', function(compiler, callback) {
    store.ready(callback)
  })
}

module.exports = OpenRecordCachePlugin
