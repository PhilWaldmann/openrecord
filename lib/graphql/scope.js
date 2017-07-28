exports.definition = {

  mixinCallback: function(){
    this.on('finished', function(){
      // add meta data to model query functions

      this.model.find.options = {
        args: {id: 'integer'},
        args_mapping: ['id']
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
    })
  },

  scope: function(name, fn, options){
    var self = this.callParent(name, fn)
    this.staticMethods[name].options = options
    return self
  }
}
