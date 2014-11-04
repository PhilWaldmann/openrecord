exports.model = {  
  searchScope: function(scope){
    var self = this.chain();
    
    self.setInternal('search_scope', scope);
    
    if(scope === 'base'){
      self.limit(1);
    }
    
    return self;
  },
  
  
  recursive: function(){
    return this.searchScope('sub');
  }
};

exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    this.beforeFind(function(options){
      options.scope = this.getInternal('search_scope') || 'one';
    }, -70);
  
  }
};