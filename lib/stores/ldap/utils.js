exports.utils = {

  mergeBinary: function(chain, entry){
    var obj = entry.object;
    
    obj.objectClass = obj.objectClass || obj.objectclass;
                  
    if(chain.options.polymorph){
      var attr = chain.definition.store.getAllAvailableAttributes(true);     
      for(var i = 0; i < attr.length; i++){
        if(entry.raw[attr[i]]){ //.raw from ldapjs
          obj[attr[i]] = entry.raw[attr[i]];
        }
      }
    }else{
      for(var name in chain.definition.attributes){
        if(chain.definition.attributes.hasOwnProperty(name)){
          var attr = chain.definition.attributes[name];
          if(attr.type.binary && entry.raw[name]){ //.raw from ldapjs
            obj[name] = entry.raw[name];
          }
        }
      }
    }
    
    return obj;
  }
  
};