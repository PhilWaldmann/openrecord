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
      
      var user_id = null;
      
      if(typeof self.store.getUserByFn === 'function'){
        user_id = self.store.getUserByFn.call(self.store, this, self);
      }else{
        if(this.context && this.context.user){
          user_id = this.context.user.id;
        }
      }
      
      if(!this.__exists){
        if(self.attributes.created_at){
          this.created_at = this.created_at || now;
        }
      
        if(self.attributes.creator_id){
          this.creator_id = this.creator_id || user_id;
        }
      }
      
      if(this.hasChanges()){ //only set updated_at or updater_id if there are any changes
        if(self.attributes.updated_at && !this.hasChanged('updated_at')){
          this.updated_at = now;
        }
      
        if(self.attributes.updater_id && !this.hasChanged('updater_id')){
          this.updater_id = user_id || this.updater_id;
        }
      }
            
      return true;
    });
  }
};

exports.store = {
  getUserBy: function(callback){
    this.getUserByFn = callback;
  }
};