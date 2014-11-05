var parseDN = require('ldapjs').parseDN;
var Utils = require('../../utils');


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    this.dnAttribute = 'dn';
    this.objectClassAttribute = 'objectClass';
    
    //do it after the custom class definition was done.
    this.use(function(){
      this.attribute(this.dnAttribute, String);
      this.attribute(this.objectClassAttribute, String);
      
    
      this.getter('parent_' + this.dnAttribute, function(){
        try{
          return parseDN(this.attributes[self.dnAttribute]).parent().toString();
        }catch(e){
          return null;
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
          if(this.models[i].definition.attributes[name].type.binary){
            tmp.push(name + ';binary');
          }else{
            tmp.push(name);
          }
          
        }
      }
    }
    
    return Utils.uniq(tmp);
  }
}