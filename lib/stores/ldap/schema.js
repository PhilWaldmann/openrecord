exports.definition = {
  mixinCallback: function() {
    this.__isContainer = false
  },

  isContainer: function(rdnPrefix) {
    if (rdnPrefix) this.rdnPrefix(rdnPrefix)

    this.hasChildren('children', {
      from: 'dn',
      to: 'parent_dn',
      autoSave: true
    })

    this.hasChildren('all_children', {
      from: 'dn',
      to: 'parent_dn',
      recursive: true,
      autoSave: true
    })

    this.hasParent('parent', { model: this.modelName, autoSave: true })

    this.__isContainer = true

    return this
  }
}
