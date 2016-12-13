exports.definition = {
  mixinCallback: function(){
    this.__isContainer = false;
  },


  isContainer: function(rdn_prefix){
    if(rdn_prefix) this.rdnPrefix(rdn_prefix);

    var self = this;

    this.hasMany('children', {
      polymorph: true,
      ldap:'children',
      recursive: false
    });

    this.hasMany('all_children', {
      polymorph: true,
      ldap:'children',
      recursive: true
    });

    this.belongsTo('parent', {model: this.model_name, ldap: 'parent'});

    this.__isContainer = true;

    return this;
  }
};
