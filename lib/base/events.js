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
        _events = scope.events;
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



/*
 * RECORD
 */
exports.record = {
  //Overwrite the original eventemitter emit method
  mixinCallback: function(){
    var original_emit = this.emit;
    
    this.emit = function(name){
      var args = Utils.args(arguments);
    
      original_emit.apply(this, args);

      this.model.definition.emit.apply(this.model.definition, [this].concat(args));
      return this;   
    };
  }
};