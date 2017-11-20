exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      var attributes = this.getCache('attributes')
      if(attributes){
        this.setTableAttributes(attributes)
        return next()
      }

      if(!this.table_name) return next()
      if(!this.store.loadTableAttributes) return next()
      if(this.store.config.diableAutoload) return next()

      var self = this

      this.store.loadTableAttributes(this.table_name)
      .then(function(attributes){
        self.setCache('attributes', attributes)
        self.setTableAttributes(attributes)
        next()
      }).catch(function(error){
        next()
        return self.store.handleException(error)
      })
    }, 80)
  },

  setTableAttributes: function(attributes){
    var self = this

    attributes.forEach(function(attr){
      self.attribute(attr.name, attr.type, attr.options)
      attr.validations.forEach(function(validation){
        self[validation.name].apply(self, [attr.name].concat(validation.args))
      })
    })
  }
}
