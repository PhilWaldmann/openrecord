/*
 * STORE
 */
exports.store = {  
  handleException: function(exception){
    if(this.listeners('exception').length > 0){
      this.emit('exception', exception);
    }else{
      throw exception;
    }
  }
};

/*
 * DEFINITION
 */
exports.definition = {
  handleException: function(exception){
    if(this.listeners('exception').length > 0){
      this.emit('exception', exception);
    }else{
      this.store.handleException(exception);
    }
  }
};

/*
 * MODEL
 */
exports.model = {
  handleException: function(exception){
    this.definition.handleException(exception);
  }
};

/*
 * RECORD
 */
exports.record = {
  handleException: function(exception){
    if(this.listeners('exception').length > 0){
      this.emit('exception', exception);
    }else{
      this.model.handleException(exception);
    }
  }
};