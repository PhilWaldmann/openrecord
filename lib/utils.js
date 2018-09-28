const inflection = require('inflection')

exports.series = function(tasks) {
  if (!tasks || tasks.length === 0) return Promise.resolve()

  var result = []
  return tasks
    .reduce(function(current, next) {
      return current.then(next).then(function(res) {
        result.push(res)
      })
    }, Promise.resolve())
    .then(function() {
      return result
    })
}

exports.parallel = function(tasks) {
  if (!tasks || tasks.length === 0) return Promise.resolve()

  return Promise.all(
    tasks.map(function(task) {
      if (!task) return
      if (task.then) return task
      if (typeof task === 'function')
        return new Promise(function(resolve) {
          resolve(task())
        })
      return Promise.resolve(task)
    })
  )
}

exports.parallelWithPriority = function(tasks) {
  if (!tasks || tasks.length === 0) return Promise.resolve()
  const grouped = []
  const self = this

  // group by priority
  tasks.forEach(function(task, index) {
    if (index > 0 && tasks[index - 1].priority === task.priority) {
      grouped[grouped.length - 1].push(task)
    } else {
      grouped.push([task])
    }
  })

  if (grouped.length === 1) {
    return self.parallel(grouped[0])
  }

  return self.series(
    grouped.map(function(list) {
      if (list.length === 1) return list[0] // the task
      return function() {
        return self.parallel(list)
      }
    })
  )
}

exports.clone = function(obj, exclude) {
  var tmp = obj

  exclude = exclude || []

  if (!obj) return obj

  if (Array.isArray(obj)) {
    tmp = []
    for (var i = 0; i < obj.length; i++) {
      tmp.push(exports.clone(obj[i]))
    }
    return tmp
  }

  if (typeof obj === 'object') {
    if (typeof obj.toJson === 'function') {
      return obj.toJson()
    }

    if (typeof obj.toJSON === 'function') {
      return obj.toJSON()
    }

    tmp = {}
    Object.keys(obj).forEach(function(name) {
      if (exclude.indexOf(name) !== -1) {
        tmp[name] = obj[name]
      } else {
        tmp[name] = exports.clone(obj[name])
      }
    })
  }

  return tmp
}

exports.uniq = function(arr) {
  return arr.filter(function(v, i, a) {
    return a.indexOf(v) === i
  })
}

exports.compareObjects = function(obj1, obj2, deep) {
  if (obj1 === obj2) return true
  if (!obj1) return false
  if (!obj2) return false

  var match = true

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false
    obj1.forEach(function(el, index) {
      if (deep) {
        if (!exports.compareObjects(obj1[index], obj2[index])) match = false
      } else {
        if (obj1[index] !== obj2[index]) match = false
      }
    })
    return match
  }

  if (typeof obj1 === 'object' && typeof obj2 === 'object') {
    const obj1Keys = Object.keys(obj1)
    const obj2Keys = Object.keys(obj2)

    if (obj1Keys.length !== obj2Keys.length) return false
    if (obj1Keys.sort().toString() !== obj2Keys.sort().toString()) return false

    Object.keys(obj1).forEach(function(key) {
      if (!match) return
      if (deep) {
        if (!exports.compareObjects(obj1[key], obj2[key])) match = false
      } else {
        if (obj1[key] !== obj2[key]) match = false
      }
    })

    return match
  }

  return false
}

exports.flatten = function(arr) {
  return arr.concat.apply([], arr)
}

// e.g. models or migrations
exports.getModules = function(module) {
  const self = this
  const modules = {}

  if (typeof module === 'function') {
    modules[module.name || exports.getHash(module)] = module
    return modules
  }

  if (typeof module === 'string') {
    return self.require(module, { includePathNames: true })
  }

  if (typeof module === 'object' && !Array.isArray(module)) {
    return module
  }

  module.forEach(function(item) {
    if (typeof item === 'string') {
      Object.assign(modules, self.require(module, { includePathNames: true }))
    }

    if (typeof item === 'function') {
      modules[item.name || exports.getHash(module)] = item
    }
  })

  return modules
}

exports.require = function(path) {
  if (!Array.isArray(path)) path = [path]
  throw new Error(
    'If you want to load models, migrations or plugins via paths, you need to require `openrecord/lib/base/dynamic_loading` as a plugin and install `glob`.\nLoading file "' +
      path[0] +
      '" failed!'
  )
}

exports.mixin = function(target, _mixins, options) {
  const self = this
  if (!options) options = {}
  if (!Array.isArray(_mixins)) _mixins = [_mixins]
  var mixins = []

  _mixins = _mixins.concat.apply([], _mixins) // flatten mixins

  _mixins.forEach(function(mixin) {
    if (typeof mixin === 'string') {
      mixins = mixins.concat(self.require(mixin, options))
    } else {
      if (options.only) mixins.push(mixin[options.only])
      else mixins.push(mixin)
    }
  })

  for (var i in mixins) {
    var mixin = mixins[i]
    if (!mixin) continue
    Object.keys(mixin).forEach(function(name) {
      const value = mixin[name]
      if (name === 'mixinCallback' && typeof value === 'function') {
        target.mixin_callbacks = target.mixin_callbacks || []
        target.mixin_callbacks.push(value)
      } else {
        // set parent
        if (
          typeof target[name] === 'function' &&
          typeof value === 'function' &&
          value !== target[name]
        ) {
          value._parent = target[name]
        }

        if (options.enumerable === false) {
          Object.defineProperty(target, name, {
            enumerable: false,
            configurable: true,
            value: value
          })
        } else {
          target[name] = value
        }
      }
    })
  }
}

exports.mixinCallbacks = function(target, args, dontRemoveCallbacks) {
  // call mixin constructors
  if (target.mixin_callbacks) {
    for (var i in target.mixin_callbacks) {
      target.mixin_callbacks[i].apply(target, args)
    }

    if (dontRemoveCallbacks !== true) {
      delete target.mixin_callbacks
    }
  }
}

exports.args = function(args) {
  return Array.prototype.slice.call(args)
}

exports.getModelName = function(name) {
  return inflection.camelize(inflection.singularize(name))
}

exports.getHash = function(obj) {
  if(!obj) return null

  var val = obj
  if(typeof obj === 'object') val = JSON.stringify(val)
  if(typeof obj !== 'string') val = val.toString()

  return val
    .split('')
    .reduce(function(a, b) {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
}

exports.addedArrayValues = function(original, changed) {
  if (!changed) return []
  if (!original) return changed

  var tmp = []
  for (var i = 0; i < changed.length; i++) {
    if (original.indexOf(changed[i]) === -1) {
      tmp.push(changed[i])
    }
  }
  return tmp
}

exports.removedArrayValues = function(original, changed) {
  if (!original) return []
  if (!changed) return original
  return exports.addedArrayValues(changed, original)
}
