exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    this.scope('totalCount', function(){
      var key = self.primary_keys[0];
      this.count(self.getName() + '.' + key, true);
      this.limit(null, null);
      this.order(null);
    });
  }
};