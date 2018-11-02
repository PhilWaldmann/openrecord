exports.migration = {
  stampable: function () {
    this.timestamp()
    this.userstamp()
  },

  timestamp: function () {
    this.datetime('created_at', {
      comment: 'Time of insert',
      default: 'NOW()'
    })
    this.datetime('updated_at', {
      comment: 'Time of last update',
      default: 'NOW()'
    })
  },

  userstamp: function () {
    this.integer('creator_id', {
      comment: 'Identifier of the creator '
    })
    this.integer('updater_id', {
      comment: 'Identifier of the last modifier'
    })
  }
}

exports.definition = {
  stampable: function () {
    var self = this
    this.beforeSave(function () {
      var now = new Date()

      var userId = null

      if (typeof self.store.getUserByFn === 'function') {
        userId = self.store.getUserByFn(this, self)
      } else {
        if (this.context && this.context.user) {
          userId = this.context.user.id
        }
      }

      if (!this.__exists) {
        if (self.attributes.created_at) {
          this.created_at = this.created_at || now
        }

        if (self.attributes.creator_id) {
          this.creator_id = this.creator_id || userId
        }
      }

      if (this.hasChanges()) {
        // only set updated_at or updater_id if there are any changes
        if (self.attributes.updated_at && !this.hasChanged('updated_at')) {
          this.updated_at = now
        }

        if (self.attributes.updater_id && !this.hasChanged('updater_id')) {
          this.updater_id = userId || this.updater_id
        }
      }

      return true
    })

    return this
  }
}

exports.store = {
  getUserBy: function (callback) {
    this.getUserByFn = callback
  }
}