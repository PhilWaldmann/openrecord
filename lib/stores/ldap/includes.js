var parseDN = require('ldapjs').parseDN;

exports.definition = {
  mixinCallback: function(){
    
    var self = this;
    
    this.beforeInclude(function(Chain, records, include, cache){

      if(!include.relation || !include.relation.container) return;
      
      var container = include.relation.container;
      var key = cache.key = self.dnAttribute;
      
      cache.record_map = cache.record_map || {};
      
      if(container === 'children'){ //if we load polymorphic child elements
        key += '_like'; //to a substring search
        Chain.setInternal('without_objectClass', true); //don't add objectClass=ou
        Chain.asRaw();
        Chain.select(['dn', 'username', 'type']);
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

      if(condition[key].length === 1){
        //via scope: one and root
        Chain.searchRoot(condition[key][0]).searchScope('one');
      }

      Chain.where(condition);      
      
    }, 90);
    
    
    
    
    
    
    
    this.afterInclude(function(result, records, include, cache){

      if(!include.relation || include.relation.container !== 'children' || !include.relation.polymorph) return;
      
      cache.key = 'parent_' + cache.key;

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