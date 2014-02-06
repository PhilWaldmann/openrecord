
/*
 * MODEL
 */
exports.model = {
  setContext: function(context){
    var self = this.chain();
    
    self.setInternal('context', context);
    
    return self;
  }
};


/*
 * CHAIN
 */
exports.chain = {
  mixinCallback: function(){
    var self = this;
    this.__defineGetter__('context', function(){
      return this.getInternal('context');
    });
  }
};


/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(){
    var self = this;
    this.__defineGetter__('context', function(){
      return this.__chained_model ? this.__chained_model.getInternal('context') : null;
    });
  }
};