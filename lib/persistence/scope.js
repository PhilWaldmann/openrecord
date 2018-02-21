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


    this.onInclude(function(Chain, records, include){
      if(include.scope && typeof Chain[include.scope] === 'function'){
        if(this.getInternal('conditions')) Chain.addInternal('conditions', this.getInternal('conditions'))
        if(this.getInternal('joins')) Chain.addInternal('joins', this.getInternal('joins'))

        Chain[include.scope](include.scope_attributes)// TODO: where do they come from?
        Chain.runScopes()
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
