var parseDN = require('ldapjs').parseDN;

exports.definition = {
  mixinCallback: function(){
    
    var self = this;
    
    this.beforeInclude(function(Chain, records, include, cache){

      if(!include.relation || !include.relation.container) return;

      var container = include.relation.container;
      var key = cache.key = include.relation.foreign_key || self.dnAttribute;

      cache.record_map = cache.record_map || {};
      
      if(container === 'children' && !include.relation.foreign_key){ //if we load child elements, except if the foreign_key is defined (e.g. memberOf)
        key += '_like'; //search with `like` (substring)
      }
      
      if(container === 'children' && include.relation.polymorph){ //if we load polymorphic child elements, take all available attributes in the store...
        Chain.setInternal('without_objectClass', true); //don't add objectClass=ou
        Chain.asRaw();
        Chain.select(self.store.getAllAvailableAttributes());       
      }
      
      
      var condition = {};
      condition[key] = [];
      
      for(var i = 0; i < records.length; i++){
        if(records[i].dn){
          var dn = parseDN(records[i][self.dnAttribute]);
          
          if(container === 'parent') dn = dn.parent();
          
          if(dn){
            dn = dn.toString();
                     
            if(condition[key].indexOf(dn) === -1){
              condition[key].push(dn);
            }            
                      
            cache.record_map[dn] = cache.record_map[dn] || [];
            cache.record_map[dn].push(records[i]);
          }      
        }
      }

      if(condition[key].length === 1 && !include.relation.foreign_key){ //if we got a foreign_key, we need to search everywhere... theoretically
        //via scope: one and root
        Chain.searchRoot(condition[key][0])        
        Chain.recursive(include.relation.recursive);
        
        if(include.relation.polymorph){
          Chain.where(condition);
        }
      }else{
        Chain.where(condition);
      }

        
      
    }, 90);
    
    
    
    
    
    
    
    this.afterInclude(function(result, records, include, cache){
      
      if(!include.relation || include.relation.container !== 'children') return; //return if it's no container relation
      if(!include.relation.foreign_key) cache.key = 'parent_' + cache.key; //prefix it with `parent_` if it's a simple container include (via dn)
      if(!include.relation.polymorph) return; //return if the relation isn't polymorphic
      

      for(var i = 0; i < result.length; i++){
        if(cache.record_map[result[i][self.dnAttribute]]){
          result.splice(i, 1);
          i--;
          continue;
        }        
        
        var objectClass = result[i][self.objectClassAttribute];
        var Model = self.store.getByObjectClass(objectClass);

        if(!(result[i] instanceof Model)){
          result[i] = Model.new(result[i]);
        }
      }

    }, 110);
    
    
  }
}