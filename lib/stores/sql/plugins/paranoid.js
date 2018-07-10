exports.migration = {
  paranoid: function() {
    this.datetime('deleted_at')
    this.integer('deleter_id')
  }
}

exports.definition = {
  paranoid: function() {
    var self = this

    this.scope('withDeleted', function() {
      this.setInternal('withDeleted', true)
    })

    this.beforeFind(function() {
      var withDeleted = this.getInternal('withDeleted') || false

      if (!withDeleted && self.attributes.deleted_at) {
        this.where({ deleted_at: null })
      }
    })

    this.destroy = function(options) {
      this.deleted_at = new Date()
      return this.save(options)
    }

    return this
  }
}
