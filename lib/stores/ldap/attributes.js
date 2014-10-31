/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.dnAttribute = 'dn';
    this.objectClassAttribute = 'objectClass';
    
    //do it after the custom class definition was done.
    this.use(function(){
      this.attribute(this.dnAttribute, String);
      this.attribute(this.objectClassAttribute, String);
    });
    
    
    //add all attribute names to the search attributes
    this.beforeFind(function(options){
      options.attributes = Object.keys(this.definition.attributes);
    }, -90);
    
  }
}