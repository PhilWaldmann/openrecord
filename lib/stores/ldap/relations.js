exports.definition = {
  isContainer: function(rdn_prefix){
    if(rdn_prefix) this.rdnPrefix(rdn_prefix);
    
    this.hasMany('children', {polymorph: true, type_key: this.objectClassAttribute, container:'children'});
    this.belongsTo('parent', {model: this.model_name, container: 'parent'});
    
    return this;
  }
};