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

exports.clone = function(obj){
  var tmp = obj

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
      tmp[name] = exports.clone(obj[name])
    })
  }

  return tmp
}


exports.uniq = function(arr){
  var u = {}
  var a = []
  for(var i = 0, l = arr.length; i < l; ++i){
    if(u.hasOwnProperty(arr[i])) {
      continue
    }
    a.push(arr[i])
    u[arr[i]] = 1
  }
  return a
}


exports.require = function(path){
  if(!Array.isArray(path)) path = [path]
  throw new Error('If you want to load models, migrations or plugins via paths, you need to require `openrecord/lib/base/dynamic_loading` as a plugin and install `glob`.\nLoading file "' + path[0] + '" failed!')
}


exports.mixin = function(target, _mixins, options){
  if(!options) options = {}
  if(!Array.isArray(_mixins)) _mixins = [_mixins]
  var mixins = []

  _mixins.forEach(function(mixin){
    if(typeof mixin === 'string'){
      mixins = mixins.concat(exports.require(mixin, options))
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

  name = exports.getModelName(name)

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
