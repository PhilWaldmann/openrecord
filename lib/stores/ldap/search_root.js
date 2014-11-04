exports.model = {  
  searchRoot: function(root){
    var self = this.chain();
    self.setInternal('search_root', root);    
    return self;
  }  
};


exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    this.beforeFind(function(options){
      options.root = this.getInternal('search_root') || self.store.config.base;
    }, -70);
  
  }
};