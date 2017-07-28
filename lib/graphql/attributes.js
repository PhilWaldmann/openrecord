exports.definition = {

  mixinCallback: function(){
    this.graphqlGetter = {}
  },

  getter: function(name, fn, returnType){
    if(returnType){
      this.graphqlGetter[name] = returnType
    }
    return this.callParent(name, fn)
  },


  variant: function(name, fn, args){
    fn.args = args
    return this.callParent(name, fn)
  }
}
