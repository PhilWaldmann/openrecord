exports.definition = {
  isContainer: function(rdn_prefix){
    if(rdn_prefix) this.rdnPrefix(rdn_prefix);
    
    var self = this;
    
    this.hasMany('children', {polymorph: true, type_key: function(r){
      return self.store.getByObjectClass(r[self.objectClassAttribute]).definition.model_name;
    }, container:'children', recursive: false});
      
    
    this.hasMany('all_children', {polymorph: true, type_key: function(r){
      return self.store.getByObjectClass(r[self.objectClassAttribute]).definition.model_name;
    }, container:'children', recursive: true});
    
    
    this.belongsTo('parent', {model: this.model_name, container: 'parent'});
    
    return this;
  }
};