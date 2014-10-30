/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      
      this.attribute('dn', String);
      this.attribute('objectClass', String);
      next();
      
    });
  }
}