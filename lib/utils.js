const inflection = require('inflection')


/**
 * Loops all properties of an object .
 * @method
 * @param {object} obj - The object to loop.
 * @param {function} fn - The function to call on every property.
 * @param {object} scope - The scope to call the function `fn`.
 */
exports.loopProperties = function(obj, fn, scope){
  scope = scope || this

  for(var name in obj){
    if(obj.hasOwnProperty(name)){
      fn.call(scope, name, obj[name])
    }
  }
}



exports.series = function(tasks){
  if(!tasks || tasks.length === 0) return Promise.resolve()

  var result = []
  return tasks.reduce(function(current, next) {
    return current
    .then(next)
    .then(function(res){
      result.push(res)
    })
  }, Promise.resolve())
  .then(function(){
    return result
  })
}

exports.parallel = function(tasks){
  if(!tasks || tasks.length === 0) return Promise.resolve()

  return Promise.all(tasks.map(function(task){
    if(!task) return
    if(task.then) return task
    if(typeof task === 'function') return task()
    return Promise.resolve(task)
  }))
}



exports.clone = function(obj, exclude){
  var tmp = obj

  exclude = exclude || []

  if(!obj) return obj

  if(Array.isArray(obj)){
    tmp = []
    for(var i = 0; i < obj.length; i++){
      tmp.push(exports.clone(obj[i]))
    }
    return tmp
  }

  if(obj && typeof obj === 'object'){
    if(typeof obj.toJson === 'function'){
      return obj.toJson()
    }

    if(typeof obj.toJSON === 'function'){
      return obj.toJSON()
    }

    tmp = {}
    Object.keys(obj).forEach(function(name) {
      if(exclude.indexOf(name) !== -1){
        tmp[name] = obj[name]
      }else{
        tmp[name] = exports.clone(obj[name])
      }
    })
  }

  return tmp
}


exports.uniq = function(arr){
  return arr.filter(function(v, i, a){
    return a.indexOf(v) === i
  })
}


exports.flatten = function(arr){
  return arr.concat.apply([], arr)
}


// e.g. models or migrations
exports.getModules = function(module){
  const self = this
  const modules = {}

  if(typeof module === 'function'){
    modules[module.name] = module
    return modules
  }

  if(typeof module === 'string'){
    return self.require(module, {includePathNames: true})
  }

  if(typeof module === 'object' && !Array.isArray(module)){
    return module
  }

  module.forEach(function(item){
    if(typeof item === 'string'){
      Object.assign(modules, self.require(module, {includePathNames: true}))
    }

    if(typeof item === 'function' && item.name){
      modules[item.name] = item
    }
  })

  return modules
}


exports.require = function(path){
  if(!Array.isArray(path)) path = [path]
  throw new Error('If you want to load models, migrations or plugins via paths, you need to require `openrecord/lib/base/dynamic_loading` as a plugin and install `glob`.\nLoading file "' + path[0] + '" failed!')
}


exports.mixin = function(target, _mixins, options){
  const self = this
  if(!options) options = {}
  if(!Array.isArray(_mixins)) _mixins = [_mixins]
  var mixins = []

  _mixins = _mixins.concat.apply([], _mixins) // flatten mixins

  _mixins.forEach(function(mixin){
    if(typeof mixin === 'string'){
      mixins = mixins.concat(self.require(mixin, options))
    }else{
      if(options.only) mixins.push(mixin[options.only])
      else mixins.push(mixin)
    }
  })

  for(var i in mixins){
    var mixin = mixins[i]

    exports.loopProperties(mixin, function(name, value){
      if(name === 'mixinCallback' && typeof value === 'function'){
        target.mixin_callbacks = target.mixin_callbacks || []
        target.mixin_callbacks.push(value)
      }else{
        // set parent
        if(typeof target[name] === 'function' && typeof value === 'function' && value !== target[name]){
          value._parent = target[name]
        }

        if(options.enumerable === false){
          Object.defineProperty(target, name, {
            enumerable: false,
            configurable: true,
            value: value
          })
        }else{
          target[name] = value
        }
      }
    })
  }
}

exports.mixinCallbacks = function(target, args, dontRemoveCallbacks){
  // call mixin constructors
  if(target.mixin_callbacks){
    for(var i in target.mixin_callbacks){
      target.mixin_callbacks[i].apply(target, args)
    }

    if(dontRemoveCallbacks !== true){
      delete target.mixin_callbacks
    }
  }
}


exports.args = function(args){
  return Array.prototype.slice.call(args)
}


exports.getModelName = function(name){
  return inflection.camelize(inflection.singularize(name))
}


exports.getStore = function(Store, name, _default, callback){
  if(!name) return callback(_default)
  if(Store.getStoreByName(name)) return callback(Store.getStoreByName(name))

  Store.waitForStore(name, callback)
}

exports.getModel = function(store, name, callback){
  if(typeof name !== 'string') return callback(name)

  name = exports.getModelName(name).toLowerCase()

  var model = store.Model(name)
  if(model){
    callback(model)
  }else{
    store.once(name + '_created', function(model){
      callback(model)
    })
  }
}


exports.getRelation = function(definition, name, callback){
  if(typeof name !== 'string') return callback(name)

  var relation = definition.relations[name]
  if(relation){
    callback(relation)
  }else{
    definition.once(name + '_added', function(relation){
      callback(relation)
    })
  }
}


exports.addDefaults = function(original, defaults){
  if(!original || typeof original !== 'object') return
  if(!defaults || typeof defaults !== 'object') return

  exports.loopProperties(defaults, function(name, value){
    if(original[name] === undefined){
      original[name] = value
    }
  })
}


exports.addedArrayValues = function(original, changed){
  if(!changed) return []
  if(!original) return changed

  var tmp = []
  for (var i = 0; i < changed.length; i++) {
    if(original.indexOf(changed[i]) === -1){
      tmp.push(changed[i])
    }
  }
  return tmp
}


exports.removedArrayValues = function(original, changed){
  if(!original) return []
  if(!changed) return original
  return exports.addedArrayValues(changed, original)
}
