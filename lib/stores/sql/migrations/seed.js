exports.migration = {
  seed: function(fn){
    return this.run(function(next){
      next();
      this.use(fn);
    });
  }
}