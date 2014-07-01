exports.definition = {
  mixinCallback: function(){
    this.scope('totalCount', function(){
      this.count();
      this.limit(null, null);
      this.order(null);
    });
  }
};