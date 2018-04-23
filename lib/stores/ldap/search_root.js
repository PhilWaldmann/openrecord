exports.model = {
  searchRoot: function(root, recursive) {
    var self = this.chain()
    self.setInternal('search_root', root)

    self.recursive(recursive === true)

    return self
  }
}

exports.definition = {
  mixinCallback: function() {
    var self = this

    this.beforeFind(function(options) {
      options.root = self.store.utils.normalizeDn(
        this.getInternal('search_root') || self.store.config.base
      )
    }, 80)
  }
}
