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
    var tmp = {};
    for(var i in this.store.interceptors){
      var name = this.store.interceptors[i];
      tmp[name] = [];
      
      this[name] = function(callback){
        this.addInterceptor(name, callback);
      }
    }
    
    //Interceptor callback lists
    this.interceptors = tmp;
  },
  
  
  addInterceptor: function(name, callback){
    if(this.interceptors[name]){
      this.interceptors[name].push(function(args, next){
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
      });
    }else{
      throw new Error('Can not find interceptor ' + name);
    }
  }
};



/*
 * RECORD
 */
exports.record = {
  callInterceptors: function(){
    var args = Utils.args(arguments);
    var name = args.shift();
    var callback = args.pop();
    
    if(!this.definition.interceptors[name]) throw new ('Can not find interceptor ' + name);
    if(typeof callback != 'function') throw new Error('No callback given!');
    
    var fns = [];
    
    for(var i in this.definition.interceptors[name]){
      fns.push(this.definition.interceptors[name][i].bind(this));
    }
    
    async.applyEach(fns, args, function(err, result){
      //we need to provide a sting instead of a boolean value to make async.applyEach() work the way we want it.
      callback(err === 'false' ? false : true);
    });
    
  }
}