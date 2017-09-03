exports.definition = {

  mixinCallback: function(){
    this.on('finished', function(){
      // add meta data to model query functions

      this.model.find.options = {
        args: this.primary_keys,
        args_mapping: this.primary_keys
      }

      this.model.limit.options = {
        args: {limit: 'integer', offset: 'integer'},
        args_mapping: ['limit', 'offset']
      }

      this.model.count.options = {
        args: {field: 'string', distinct: 'boolean'},
        args_mapping: ['field', 'distinct'],
        return_type: 'integer'
      }

      this.model.create.options = {
        args: 'writable_attributes'
      }

      this.model.create.options = {
        args: 'writable_attributes'
      }
    })
  },

  scope: function(name, fn, options){
    var self = this.callParent(name, fn)
    this.staticMethods[name].options = options
    return self
  }
}
