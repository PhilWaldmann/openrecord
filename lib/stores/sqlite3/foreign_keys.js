exports.store = {
  mixinCallback: function() {
    this.use(function() {
      if (this.config.enableForeignKeys !== false) return this.enableForeignKeys()
    }, 100)
  },

  enableForeignKeys: function(){
    return this.connection.raw('PRAGMA foreign_keys = ON')
    .catch(function(error){
      console.error('Error while enabling SQLite3 foreign_keys: ', error)
    })
  }
}
