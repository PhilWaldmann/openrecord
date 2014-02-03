var async = require('async');

var Utils = require('../utils');


/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    this.interceptors = [];
  },
  
  addInterceptor: function(name){
    this.interceptors.push(name);
  }
};



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
    var tmp = {};
    
    for(var i in this.store.interceptors){
      var name = this.store.interceptors[i];
      tmp[name] = [];
      (function(name){
        self[name] = function(callback, priority){
          self.addInterceptor(name, callback, priority);
        }
      })(name);      
    }
    
    //Interceptor callback lists
    this.interceptors = tmp;
  },
  
  
  addInterceptor: function(name, callback, priority){
    priority = priority || 0;
    
    if(this.interceptors[name]){
      var fn = function(args, next){
        if(callback.length <= args.length){
          //via return;
          var result = callback.apply(this, args);
          next(result === false ? 'false' : null); //see async.applyEach below
        }else{
          //via next();
          args.push(function(result){
            next(result === false ? 'false' : null); //see async.applyEach below
          });
          callback.apply(this, args);
        }
      };
      
      fn.priority = priority;

      this.interceptors[name].push(fn);
    }else{
      throw new Error('Can not find interceptor ' + name);
    }
  }
};



/*
 * MODEL
 */
exports.model = {
  callInterceptors: function(name, scope, args, callback){ //TODO: do we need the scope here?
    
    if(typeof args == 'function'){
      callback = args;
      args = [];
    }
    
    if(!this.definition.interceptors[name]) throw new ('Can not find interceptor ' + name);
    if(typeof callback != 'function') throw new Error('No callback given!');
    
    var fns = [];
    
    this.definition.interceptors[name].sort(function(a, b){
      return a.priority < b.priority;
    });
    
    for(var i in this.definition.interceptors[name]){
      fns.push(this.definition.interceptors[name][i].bind(scope));
    }
    
    if(fns.length == 0){
      return callback(true);
    }
    
    async.applyEachSeries(fns, args, function(err, result){
      //we need to provide a sting instead of a boolean value to make async.applyEach() work the way we want it.
      callback(err === 'false' ? false : true);
    });    
  }
};


/*
 * RECORD
 */
exports.record = {
  callInterceptors: function(name, args, callback){
    this.model.callInterceptors(name, this, args, callback);
  }
}

