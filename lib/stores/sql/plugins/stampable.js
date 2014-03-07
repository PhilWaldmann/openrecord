exports.migration = {
  stampable: function(){
    this.timestamp();
    this.userstamp();
  },
  
  timestamp: function(){
    this.datetime('created_at');
    this.datetime('updated_at');
  },
  
  userstamp: function(){
    this.integer('creator_id');
    this.integer('updater_id');
  }
};


exports.definition = {  
  stampable: function(){
    var self = this;
    this.beforeSave(function(){
      var now = new Date();
      
      if(!this.__exists){
        if(self.attributes.created_at){
          this.created_at = now;
        }
      }
      
      if(self.attributes.updated_at){
        this.updated_at = now;
      }
      
      return true;
    });
  }
};