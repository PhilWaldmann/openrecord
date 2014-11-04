exports.definition = {
  mixinCallback: function(){
    this.is_container = false;
  },
  
  
  
  isContainer: function(rdn_prefix){
    if(rdn_prefix) this.rdnPrefix(rdn_prefix);
    
    this.is_container = true;
    
    this.hasMany('children', {polymorph: true, type_key: this.objectClassAttribute, container:'children'});
    this.belongsTo('parent', {model: this.model_name, container: 'parent'});
    
    return this;
  }
};