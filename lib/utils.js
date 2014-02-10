var glob = require('glob');
var inflection = require('inflection');


/**
 * Loops all properties of an object .
 * @method
 * @param {object} obj - The object to loop.
 * @param {function} fn - The function to call on every property.
 * @param {object} scope - The scope to call the function `fn`.
 */
exports.loopProperties = function(obj, fn, scope){
  scope = scope || this;
  
  for(var name in obj){
    if(obj.hasOwnProperty(name)){
      fn.call(scope, name, obj[name]);
    }
  }
};

exports.clone = function(obj){
  var tmp = {};
  Object.keys(obj).forEach(function (name) {
    tmp[name] = obj[name];
  });
  return tmp;
}

exports.require = function(path, options){
  if(!options) options = {};
  if(!(path instanceof Array)) path = [path];
  
  var files = [];
  var tmp = [];
  
  if(options.includePathNames === true){
    tmp = {};
  }
  
  for(var i in path){
    files = files.concat(glob.sync(path[i], options));
  }
  
  for(var i in files){
    var plugin = require(files[i]);
    if(options.only) plugin = plugin[options.only];
    
    
    if(plugin){
      if(options.includePathNames === true){
        tmp[files[i]] = plugin;
      }else{
        tmp.push(plugin);
      }
    }
      
  }
    
  return tmp;
};

exports.mixin = function(target, mixins, options){
  if(!options) options = {};
  
  if(typeof mixins == 'string' || mixins instanceof Array){
    mixins = exports.require(mixins, options);
  }
    
  if(!(mixins instanceof Array)) mixins = [mixins];
  
  for(var i in mixins){
    var mixin = mixins[i];
    
    exports.loopProperties(mixin, function(name, value){
      if(name == 'mixinCallback' && typeof value == 'function'){
        target.mixin_callbacks = target.mixin_callbacks || [];
        target.mixin_callbacks.push(value);      
      }else{
        if(options.enumerable === false){
          Object.defineProperty(target, name, {
            enumerable: false,
            value: value
          });
        }else{
          target[name] = value;
        }        
      }      
    });
  }
  
};

exports.mixinCallbacks = function(target, args, dont_remove_callbacks){ 
  //call mixin constructors
  if(target.mixin_callbacks){
    
    for(var i in target.mixin_callbacks){
      target.mixin_callbacks[i].apply(target, args);
    }

    if(dont_remove_callbacks !== true){
      delete target.mixin_callbacks;
    }    
    
  }  
};


exports.args = function(args){
  return Array.prototype.slice.call(args);
};


exports.getModelName = function(name){
  return inflection.camelize(inflection.singularize(name));
}

exports.getModel = function(store, name, callback){
  if(typeof name != 'string') return callback(name);
  
  name = exports.getModelName(name);
  
  var model = store.Model(name);
  if(model){
    callback(model);
  }else{
    store.once(name + '_created', function(model){
      callback(model);
    });
  }
  
}