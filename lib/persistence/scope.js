/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.default_scopes = []

    this.beforeFind(function(){
      return this.runScopes()
    }, 200)


    this.beforeInclude(function(Chains, records, include, cache){
      if(include.scope){
        if(include.relation){
          Chains.push(include.relation.model.chain())
        }else{
          Chains.push(this.model.chain())
        }
      };
    })


    // run scopes of the current model. like `.include(':totalCount')`
    this.onInclude(function(Chain, records, include){
      if(include.scope && typeof Chain[include.scope] === 'function'){
        if(this.getInternal('conditions')) Chain.addInternal('conditions', this.getInternal('conditions'))
        if(this.getInternal('joins')) Chain.addInternal('joins', this.getInternal('joins'))
                
        Chain[include.scope](include.args)
        return Chain.runScopes()
      }
    })



    this.afterInclude(function(Model, result, records, include, cache){
      if(include.scope){
        var varName = '$' + include.scope

        if(include.relation){
          varName = include.relation.name + '$' + include.scope
        }

        this[varName] = result
      }
    })
  }
}
