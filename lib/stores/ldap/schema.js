exports.definition = {
  isContainer: function(rdn_prefix){
    if(rdn_prefix) this.rdnPrefix(rdn_prefix);
    
    var self = this;
    
    this.hasMany('children', {
      polymorph: true, 
      ldap:'children',
      recursive: false
    });

    this.belongsTo('parent', {model: this.model_name, ldap: 'parent'});
    
    return this;
  }
};