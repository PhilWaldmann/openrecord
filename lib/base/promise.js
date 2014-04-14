exports.model = exports.record = {
    
  then: function (onResolve, onReject) {
    var self = this.chain ? this.chain() : this;
    var state = this.getInternal('promise_state');
    var exec = false;
    
    if(!state){
      state = 'pending';
      this.setInternal('promise_state', state);
      exec = !this.getInternal('running');
    }
    
    switch(state){
      case 'pending':
        this.addInternal('promise_thens', { fulfilled: onResolve, rejected: onReject });
        break;
        
      case 'fulfilled':
        onResolve(this.getInternal('promise_value'));
        break;
        
      case 'rejected':
        onReject(this.getInternal('promise_value'));
        break;
    }
    
    if(exec){
      self.execPromise();
    }
    
    return self;
  },
  
  
  
  execPromise: function(){
    this.reject('nothing to exec');
  }, 
  
  running: function(){
    this.setInternal('running', true);
  },
  
  fulfill: function (val) {
    this._complete('fulfilled', val);
  },
  
  reject: function (ex) {
    this._complete('rejected', ex);
  },
  
  
  
  /* "Private" method. */  
  _complete: function (which, value) {
    var state = this.getInternal('promise_state');
    
    if(state !== 'pending'){
      throw new Error("promise already completed");
      return;
    }

    this.setInternal('promise_value', value);
    this.setInternal('promise_state', which);
    this.setInternal('running', false);
      
    var thens = this.getInternal('promise_thens');

  	for(var i = 0; i < thens.length; i++){
  	  var then = thens[i];
      if(typeof then[which] == 'function'){
        then[which].call(this, value);
      }
  	}
    
  },
  
  
  
  
  
  catch: function(type, fn){
    if(typeof type == 'function' && !fn){
      fn = type;
      type = null;
    }
    if(!type){
      return this.then(null, fn);
    }else{
      return this.then(null, function(err){
        var call = false;
        if(typeof type == 'function'){
          call = (err instanceof type);
        }else{
          call = (type == err.name);
        }        
        if(call) fn(err);
      });
    }    
  },
};
