exports.model = {
  find: function() {
    var self = this.callParent.apply(
      this,
      this.definition.store.utils.args(arguments)
    )
    self.setInternal('action', 'show')
    return self
  }
}
