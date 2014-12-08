exports.definition = {
  mixinCallback: function(){
    
    this.beforeInclude(function(Chains, records, include, cache){
      if(include.scope){
        if(include.relation){
          Chains.push(include.relation.model.chain());
        }else{
          Chains.push(this.model.chain());
        }        
      };
    });
    
    this.onInclude(function(Chain, records, include){
      if(include.scope && typeof Chain[include.scope] === 'function'){
        if(this.getInternal('conditions')) Chain.addInternal('conditions', this.getInternal('conditions'));
        if(this.getInternal('joins')) Chain.addInternal('joins', this.getInternal('joins'));
        
        Chain[include.scope](include.scope_attributes);//TODO: where do they come from?        
      }
    });
    
    
    
    this.afterInclude(function(Model, result, records, include, cache){
      if(include.scope){
        var var_name = '$' + include.scope;

        if(include.relation){
          var_name = include.relation.name + '$'+ include.scope
        }

        this[var_name] = result;
      }
    });
    
  }
}