exports.migration = {
  seed: function(fn){
    return this.run(function(store, next){
      store.ready(function(){
        fn(store);
      });
    });
  }
}