var util = require('util');
var parseDN = require('ldapjs').parseDN;


exports.utils = {

  normalizeDn: function(dn, lowercased){
    if(util.isArray(dn)){
      for(var i = 0; i < dn.length; i++){
        dn[i] = this.normalizeDn(dn[i]);
      }

      return dn;
    }
    try{
      dn = parseDN(dn.toString()).toString().replace(/\, /g, ',');
      if(lowercased !== false) dn = dn.toLowerCase();
      return dn;
    }catch(e){
      return null;
    }
  },

  mergeBinary: function(chain, entry, obj){
    var obj = obj || entry.object;

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

    if(obj.dn){
      obj.dn = this.normalizeDn(obj.dn);
    }

    return obj;
  }

};
