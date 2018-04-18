exports.definition = {
  mixinCallback: function(){
    var self = this

    this.scope('totalCount', function(field){      
      var key = field || self.primaryKeys[0] || '*'
      this
      .count(self.store.utils.toAttributeName(key, [self.getName()]), true)
      .limit()
      .offset()
      .order(null)
    }, true)
  }
}
