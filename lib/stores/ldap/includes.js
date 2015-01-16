var parseDN = require('ldapjs').parseDN;
var Utils = require('../../utils');

exports.definition = {
  mixinCallback: function(){
    
    var self = this;
    
    this.beforeInclude(function(Chains, records, include, cache){
      var relation = include.relation;
      if(!relation || !relation.ldap) return;
      
      cache.dn_mapping = {};
      
      var type = relation.ldap;
      var dns = [];
      
      for(var i = 0; i < records.length; i++){
        var dn = records[i].dn;
        
        if(type === 'parent'){
          dn = Utils.normalizeDn( parseDN(records[i].dn).parent().toString() );
        }else{
          if(type !== 'children' && records[i][type] && relation.type === 'belongs_to_many'){
            dn = Utils.normalizeDn(records[i][type]);
          }
        }
        
        if(!dn) dn = [];
        if(!(dn instanceof Array)) dn = [dn];
        
        for(var d = 0; d < dn.length; d++){
          
          cache.dn_mapping[dn[d]] = cache.dn_mapping[dn[d]] || [];
          cache.dn_mapping[dn[d]].push(records[i]);
        
          if(dns.indexOf(dn[d]) === -1){
            dns.push(dn[d]);
            
            if(!relation.ldap_dn_search || type === 'children'){ //start a search for every dn... this seems to be the only solution for super simple ldap servers... set ldap_dn_search to e.g. 'distinguishedName' to create only one search request
              var Model = relation.model || self.model;
              var Chain = Model.chain();
              
              Chain.find(dn[d]);
              
              if(relation.polymorph){
                Chain.options.polymorph = true;
                Chain.setInternal('without_object_class', true); //don't add objectClass=ou - so we get all objects
                Chain.select(self.store.getAllAvailableAttributes()) //we need to add all needed attribute to that request to make sure every record has everything loaded
                Chain.asRaw();
              }
            
              if(type === 'children'){
                Chain.recursive(relation.recursive === true);
              }
                        
              Chains.push(Chain); 
            } 
          } 
          
        }
      }
      
      
      if(relation.ldap_dn_search && type !== 'children'){ //search all dns by e.g. 'distinguishedName'
        var Model = relation.model || self.model;
        var Chain = Model.chain();
        
        var condition = {};

        condition[relation.ldap_dn_search] = dns;
        
        Chain.where(condition);
        Chain.recursive(relation.recursive === true);
        
        if(relation.polymorph){
          Chain.options.polymorph = true;
          Chain.setInternal('without_object_class', true); //don't add objectClass=ou - so we get all objects
          Chain.select(self.store.getAllAvailableAttributes()) //we need to add all needed attribute to that request to make sure every record has everything loaded
          Chain.asRaw();
        }
        
        Chains.push(Chain);              
        
      }
    }, 110);
        
    
    
    
    
    this.afterInclude(function(Model, result, records, include, cache){
      var relation = include.relation;
      if(!relation || !relation.ldap) return;
      if(!result) return;
      
      var type = include.relation.ldap;

      if(!(result instanceof Array)) result = [result];

      for(var i = 0; i < result.length; i++){
        var dn = result[i].dn;
        
        
        if(type === 'children'){
          dn = parseDN(dn).parent();

          if(relation.recursive){
            var found = false;
            do{
              if(cache.dn_mapping[Utils.normalizeDn(dn)]){
                found = true;
                break;
              }
              if(!dn.parent()){
                found = true; //actually not, but we stop the loop here...
              }else{
                dn = dn.parent();
              }
            }while(!found);
          }
          
          dn = Utils.normalizeDn(dn);
        }
        
        
                
        if(cache.dn_mapping[dn]){
          dn_cache = cache.dn_mapping[dn];

          for(var r = 0; r < dn_cache.length; r++){
            
            if(dn_cache[r].dn === result[i].dn) continue;
              
            if(relation.polymorph){
              var objectClass = result[i].objectClass;
              var Model = self.store.getByObjectClass(objectClass);
              
              if(Model){
                result[i] = Model.new(result[i], 'read');
              }else{
                continue;
              }              
            }
            
            
            if(include.take){
              for(var as in include.take){
                //TODO: check relation type as well (see below..)
                dn_cache[r][as] = dn_cache[r][as] || [];
                var sr = result[i][include.take[as][0]];
            
                for(var t = 1; t < include.take[as].length; t++){
                  if(!sr) break;
                  if(sr instanceof Array) sr = sr[0];
                  sr = sr[include.take[as][t]];
                }
            
                if(sr){
                  dn_cache[r][as].push(sr);  
                }                        
              }
            }
            
            
            if(relation.type === 'has_many' || relation.type === 'belongs_to_many'){
              dn_cache[r][relation.name] = dn_cache[r][relation.name] || [];
              dn_cache[r][relation.name].push(result[i]);
            }else{
              dn_cache[r][relation.name] = result[i];
            }            
          }
        }
                
      }
      
    }, 110);
    
  }
  
}