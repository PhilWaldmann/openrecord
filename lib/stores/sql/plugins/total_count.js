exports.definition = {
  mixinCallback: function(){
    var self = this

    this.scope('totalCount', function(field){
      var key = field || self.primaryKeys[0] || '*'
      this
      .count(self.getName() + '.' + key, true)
      .limit()
      .offset()
      .order(null)
    })
  }
}
