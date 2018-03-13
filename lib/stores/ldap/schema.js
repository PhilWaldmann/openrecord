exports.definition = {
  mixinCallback: function(){
    this.__isContainer = false
  },


  isContainer: function(rdnPrefix){
    if(rdnPrefix) this.rdnPrefix(rdnPrefix)

    this.hasMany('children', {
      polymorph: true,
      ldap: 'children',
      recursive: false,
      autoSave: true
    })

    this.hasMany('all_children', {
      polymorph: true,
      ldap: 'children',
      recursive: true,
      autoSave: true
    })

    this.belongsTo('parent', {model: this.model_name, ldap: 'parent', autoSave: true})

    this.__isContainer = true

    return this
  }
}
