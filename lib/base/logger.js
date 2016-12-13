exports.definition = {
  mixinCallback: function(){
    this.__defineGetter__('logger', function(){
      return this.store.logger;
    });
  }
};

exports.model = {
  mixinCallback: function(){
    this.__defineGetter__('logger', function(){
      return this.definition.store.logger;
    });
  }
};

exports.record = {
  mixinCallback: function(){
    this.__defineGetter__('logger', function(){
      return this.model.definition.store.logger;
    });
  }
};
