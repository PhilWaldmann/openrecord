exports.definition = {
  mixinCallback: function() {
    var self = this

    this.scope(
      'totalCount',
      function(field) {
        const through = this.getInternal('through')
        let tableName = self.getName()

        if (through) {
          tableName = through[through.length - 1]
        }

        if (typeof field !== 'string') field = null
        var key = field || self.primaryKeys[0] || '*'

        this.count(
          this.escapeAttribute(
            self.store.utils.toAttributeName(key, [tableName])
          ),
          true
        )
          .limit()
          .offset()
          .order(null)
      },
      true
    )
  }
}
