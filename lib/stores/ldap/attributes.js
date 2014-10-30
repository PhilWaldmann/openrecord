/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.dnAttribute = 'dn';
    this.objectClassAttribute = 'objectClass';
    
    
    this.attribute(this.dnAttribute, String);
    this.attribute(this.objectClassAttribute, String);
    
    //add all attribute names to the search attributes
    this.beforeFind(function(options){
      options.attributes = Object.keys(this.definition.attributes);
    }, -90);
    
  }
}