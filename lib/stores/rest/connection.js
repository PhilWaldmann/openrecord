var restify = require('restify');

/*
 * STORE
 */
exports.store = {
  mixinCallback: function(){
    
    this.connection = restify.createJsonClient({
      url: this.config.url,
      version: this.config.version,
      userAgent: this.config.userAgent || 'openrecord'
    });
    
  },
  
  close: function(callback){
    callback();
  }
};


/*
 * CHAIN
 */
exports.chain = {
  mixinCallback: function(){
    var self = this;
    this.__defineGetter__('connection', function(){
      return self.definition.store.connection;
    });
  }
};