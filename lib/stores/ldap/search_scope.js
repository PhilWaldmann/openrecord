exports.model = {
  searchScope: function(scope){
    var self = this.chain()

    self.setInternal('search_scope', scope)

    if(scope === 'base'){      
      self.singleResult(false)
    }else{      
      self.clearInternal('single_result')
    }

    return self
  },


  recursive: function(recursiv){
    this.limit(null)
    if(recursiv === false) return this.searchScope('one')
    return this.searchScope('sub')
  }
}

exports.definition = {
  mixinCallback: function(){
    this.beforeFind(function(options){
      options.scope = this.getInternal('search_scope') || 'sub'
    }, 90)
  }
}
