exports.definition = {

  mixinCallback: function(){
    this.on('finished', function(){
      // add meta data to model query functions
      var model = this.model

      function addMeta(fnName, options){
        var originalFn = model[fnName]
        model[fnName] = function(){
          originalFn.apply(this, arguments)
        }
        model[fnName].options = options
      }

      addMeta('find', {
        args: this.primary_keys,
        args_mapping: this.primary_keys
      })

      addMeta('limit', {
        args: {limit: 'integer', offset: 'integer'},
        args_mapping: ['limit', 'offset']
      })

      addMeta('count', {
        args: {field: 'string', distinct: 'boolean'},
        args_mapping: ['field', 'distinct'],
        return_type: 'integer'
      })

      addMeta('create', {
        args: 'writable_attributes'
      })
    })
  },

  scope: function(name, fn, options){
    var self = this.callParent(name, fn)
    this.staticMethods[name].options = options
    return self
  }
}
