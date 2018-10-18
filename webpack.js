'use strict'

var STORE

function OpenRecordCachePlugin(store) {
  this.store = store
  STORE = store
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

  getResourceIdentifier(){
    return null;
  }

  getReference() {
		return null
	}

  disconnect(){}
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
  var store = STORE

  function compilation(compilation, params) {
    compilation.dependencyFactories.set(OpenRecordCacheInfusionDependency, params.normalModuleFactory)
    compilation.dependencyTemplates.set(OpenRecordCacheInfusionDependency, new OpenRecordCacheInfusionDependency.Template())

    function parser(parser){
      function callRequire(node){
        // and check if 'openrecord' or 'openrecord/store/...' was required
        if(node.arguments[0] && node.arguments[0].value && node.arguments[0].value.match(/^openrecord($|\/store\/)/)){
          // now we do the fancy webpack dance
          const dep = new OpenRecordCacheInfusionDependency(node.callee.range, node.arguments[0].value, store)
          dep.loc = node.loc
          dep.request = node.arguments[0].value // actually I don't know where request comes, but it's the file name/relative path of the required file in webpack code
          parser.state.current.addDependency(dep)
        }
      }

      // currently we search only for require calls
      if(parser.hooks){
        parser.hooks.call.for('require').tap('require', callRequire)
      }else{
        parser.plugin('call require', callRequire)
      }
    }

    if(params.normalModuleFactory.hooks){
      // from https://github.com/webpack/webpack/blob/master/lib/DefinePlugin.js
      params.normalModuleFactory.hooks.parser.for("javascript/auto").tap('parser', parser)
      params.normalModuleFactory.hooks.parser.for("javascript/dynamic").tap('parser', parser)
      params.normalModuleFactory.hooks.parser.for("javascript/esm").tap('parser', parser)
    }else{
      params.normalModuleFactory.plugin('parser', parser)
    }
  }

  function run(compiler, callback) {
    store.ready().then(function(){
      if(typeof callback === 'function') callback()
    })
  }

  function done(stats, callback){
    if(store.close) store.close()
    if(typeof callback === 'function') callback()
  }

  if(compiler.hooks){
    compiler.hooks.compilation.tap('openrecord', compilation)
    compiler.hooks.run.tapAsync('openrecord', run)
    // compiler.hooks.emit.tapAsync('openrecord', emit)
    compiler.hooks.done.tapAsync('openrecord', done)
  }else{
    compiler.plugin('compilation', compilation)
    compiler.plugin('run', run)
    // compiler.plugin('emit', emit)
    compiler.plugin('done', done)
  }
}

module.exports = OpenRecordCachePlugin
