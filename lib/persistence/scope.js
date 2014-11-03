exports.definition = {
  mixinCallback: function(){
    
    this.beforeInclude(function(Chain, records, include){     
      if(include.scope && typeof Chain[include.scope] === 'function'){
        Chain.addInternal('conditions', this.getInternal('conditions'));
        Chain[include.scope](include.scope_attributes);//TODO: where do they come from?
      }
    });
    
    
    
    this.afterInclude(function(result, records, include, cache){
      if(include.scope){
        var var_name = '$' + include.scope;

        if(include.relation){
          var_name = include.relation.name + '$'+ include.scope
        }

        console.log('SET', var_name, result, 'TO', records);
        records[var_name] = result;
      }
    });
    
  }
}