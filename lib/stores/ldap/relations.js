exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    this.on('relation_added', function(options){
              
      //the objectClass contains the "class name"... TODO: but lowercased...!!
      if(options.polymorph){
        options.type_key = self.objectClassAttribute;
      }
              
      if(options.by === 'dn'){
        if(options.type === 'has_many'){
          options.primary_key = 'dn';
          options.foreign_key = 'parent_dn'
        }else{
          options.primary_key = 'dn';
          options.foreign_key = 'parent_dn'
        }
      }
              
    });    
    
  }
};