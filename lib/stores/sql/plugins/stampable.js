exports.migration = {
  timestamp: function(){
    this.datetime('created_at');
    this.datetime('updated_at');
  },
  
  userstamp: function(){
    this.integer('creator_id');
    this.integer('updater_id');
  }
};