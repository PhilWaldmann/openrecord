const Store = require('./store')
const webpack = require('webpack')

function OpenRecordCachePlugin(store) {
  this.store = store
}


OpenRecordCachePlugin.prototype.apply = function(compiler) {
  var store = this.store
  
  // compiler.plugin('compilation', function(compilation, params) {
  //   if(!(store instanceof Store)) store = new Store(store)
  // 
  //   params.normalModuleFactory.plugin('parser', function(parser){
  //     parser.plugin("call require", function(node){
  //       if(node.arguments[0] && node.arguments[0].value.match(/^openrecord/)){
  //         console.log('FOUND IT', Object.keys(node.callee))
  //       }
  //     });
  //   })
  // 
  //   compilation.plugin('optimize-tree', function(chunks, modules, callback){
  //     // wait for the store to load all table attributes
  //     store.ready(function(){
  //       const content = JSON.stringify(store.cache)
  // 
  //       modules.forEach(function(module){
  //         var dep
  //         module.reasons.forEach(function(reason){
  //           if(reason.dependency.request.match(/^openrecord/)){
  //             dep = reason.dependency
  //           }
  //         })
  //         
  //         if(dep){
  //           console.log(dep.range)
  //           
  //           var source = module.issuer._source
  //           var req
  //           
  //           
  //           // console.log(source._value.substring(dep.range[0], dep.range[1]))
  //           
  //           // source.replacements.forEach(function(r, index){
  //           //   if(r[0] === dep.range[0] && r[1] === dep.range[1] - 1){
  //           //     req = source.replacements[index + 1] //is that naive?
  //           //   }
  //           // })
  //           // 
  //           // if(!req) throw new Error('unable to locate `require("openrecord")`')
  //           // console.log(req)
  //         }
  //       })
  compiler.plugin('emit', function(compilation, callback) {
    store.ready(function(){
      // search for `require('openrecord...')`
      compilation.chunks.forEach(function(chunk) {
        chunk.forEachModule(function(module) {
          module.dependencies.forEach(function(dep){
            if(dep.module && dep.module.request.match(/^openrecord/)){
              console.log('---', dep.module.issuer._source)
              source = dep.module.issuer._cachedSource.source
              
              var req
              source.replacements.forEach(function(r, index){
                if(r[0] === dep.range[0] && r[1] === dep.range[1] - 1){
                  req = source.replacements[index + 1] //is that naive?
                }
              })
              
              if(!req) throw new Error('unable to locate `require("openrecord")`')
              console.log(req)
              //replace __webpack_require__ with custom function to inject cache object
              req[2] = [
                '(function(path){',
                  'return function(config){',
                    'config.cache = ' + JSON.stringify(store.cache) + ';',
                    'return new ' + req[2] + '(path)(config)',
                  '}',
                '})'
              ].join('\n')
              
              console.log(source.listMap())
            }
          })
        })
      })
      callback()
    })
  })
}

module.exports = OpenRecordCachePlugin
