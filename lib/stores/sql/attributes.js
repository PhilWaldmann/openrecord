exports.definition = {
  mixinCallback: function(){
    this.use(function(){
      var attributes = this.getCache('attributes')
      if(attributes){
        return this.setTableAttributes(attributes)
      }

      if(!this.table_name) return
      if(!this.store.loadTableAttributes) return
      if(this.store.config.autoAttributes === false) return

      var self = this

      return this.store.loadTableAttributes(this.table_name)
      .then(function(attributes){
        self.setCache('attributes', attributes)
        return self.setTableAttributes(attributes)
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
