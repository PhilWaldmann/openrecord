exports.model = exports.record = {
  execPromise: function () {
    var targetfn = this.getInternal('promise_target');

    if(!targetfn || typeof this[targetfn] === 'function'){
      targetfn = this.chained ? 'exec' : 'save'
    }

    var self = this;
    self[targetfn](function(result){
      self.fulfill(result);
    });
    
    return self;
  }
};