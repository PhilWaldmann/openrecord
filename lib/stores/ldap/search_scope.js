exports.model = {  
  searchScope: function(scope){
    var self = this.chain();
    
    self.setInternal('search_scope', scope);
    
    if(scope === 'base'){
      self.limit(1);
    }
    
    return self;
  },
  
  
  recursive: function(recursiv){
    this.limit(null);
    if(recursiv === false) return this.searchScope('one');    
    return this.searchScope('sub');
  }
};

exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    this.beforeFind(function(options){
      options.scope = this.getInternal('search_scope') || 'sub';
    }, 90);
  
  }
};