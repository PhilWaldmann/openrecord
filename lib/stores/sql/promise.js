var Promise = require('bluebird/js/main/promise')();

exports.model = {
  catch: function() {
    return this.caught.apply(this, arguments);
  },

  caught: function() {
    var promise = this.then();
    return promise.caught.apply(promise, arguments);
  },

  lastly: function() {
    var promise = this.then();
    return promise.lastly.apply(promise, arguments);
  },

  finally: function() {
    return this.lastly.apply(this, arguments);
  }
};
