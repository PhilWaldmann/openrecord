exports.migration = {
  seed: function(fn){
    return this.run(function(next){
      next();
      this.ready(function(){
        fn(this, this);
      });
    });
  }
}