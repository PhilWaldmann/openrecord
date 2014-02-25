exports.migration = {
  run: function(fn){
    var self = this;
    this.queue.push(function(next){
      fn.call(self.store, next);
      if(fn.length == 0){
        next();
      }
    });
    
    return this;
  }
}