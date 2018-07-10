exports.model = {
  searchScope: function(scope) {
    var self = this.chain()

    self.setInternal('search_scope', scope)

    if (scope === 'base') {
      self.singleResult(false)
    } else {
      self.clearInternal('single_result')
    }

    return self
  },

  recursive: function(recursiv) {
    const self = this.limit(null)
    if (recursiv === false) return self.searchScope('one')
    return self.searchScope('sub')
  }
}

exports.definition = {
  mixinCallback: function() {
    this.beforeFind(function(options) {
      options.scope = this.getInternal('search_scope') || 'sub'
    }, 90)
  }
}
