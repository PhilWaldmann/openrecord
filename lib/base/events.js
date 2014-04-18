var events = require('events');

var Utils = require('../utils');

/*
 * DEFINITION
 */
exports.definition = {
  emit: function(scope, name){
    var args = Utils.args(arguments);
    
    
    if(typeof scope == 'string'){
      events.EventEmitter.prototype.emit.apply(this, args);
      this.store.emit.apply(this.store, args);
    }else{
      args.shift();
      
      var _events;
      if(scope._events){
        _events = scope._events;
      }
      
      //EMIT on the scope object
      //Object.defineProperty(scope, '_events', {value: this._events, enumerable: false});    
      scope._events = this._events;
      events.EventEmitter.prototype.emit.apply(scope, args);
      if(!_events){
        delete scope._events;
      }
      

      //EMIT on the store object
      //Object.defineProperty(scope, '_events', {value: this.store._events, enumerable: false});
      scope._events = this.store._events;
      events.EventEmitter.prototype.emit.apply(scope, args);
      
      if(!_events){
        delete scope._events;
      }else{
        scope.events = _events;
      }
    }
    
    return this;
  }
};