var parseDN = require('ldapjs').parseDN;
var Utils = require('../../utils');


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    
    //do it after the custom class definition was done.
    this.use(function(){
      this.attribute('dn', String, {emit_events: true});
      this.attribute('parent_dn', String, {emit_events: true});
      this.attribute('objectClass', 'object_class', {default: self.objectClass});
      
    
      this.on('parent_dn_changed', function(record, old_value, value){
        if(value){
          record.dn = self.dn(record);
        }
      });
      
      this.on('dn_changed', function(record, old_value, value){
        if(value){
          record.attributes.parent_dn = parseDN(value).parent().toString(); //sets the parent_dn, but we don't want to fire a change event
        }
      });
      
    });
    
    
    //add all attribute names to the search attributes
    this.beforeFind(function(options){
      options.attributes = Object.keys(this.definition.attributes);
    }, 90);
    
  }
}


exports.store = {
  getAllAvailableAttributes: function(){
    var tmp = [];
    
    for(var i in this.models){
      for(var name in this.models[i].definition.attributes){
        if(this.models[i].definition.attributes.hasOwnProperty(name)){
          tmp.push(name);          
        }
      }
    }
    
    return Utils.uniq(tmp);
  }
}