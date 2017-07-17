exports.definition = {
  mixinCallback: function(){
    this.__isContainer = false
  },


  isContainer: function(rdnPrefix){
    if(rdnPrefix) this.rdnPrefix(rdnPrefix)

    this.hasMany('children', {
      polymorph: true,
      ldap: 'children',
      recursive: false
    })

    this.hasMany('all_children', {
      polymorph: true,
      ldap: 'children',
      recursive: true
    })

    this.belongsTo('parent', {model: this.model_name, ldap: 'parent'})

    this.__isContainer = true

    return this
  }
}
