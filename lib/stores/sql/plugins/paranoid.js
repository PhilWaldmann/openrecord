exports.migration = {
  paranoid: function(){
    this.datetime('deleted_at');
    this.integer('deleter_id');
  }
};

exports.definition = {  
  paranoid: function(){
    var self = this;
    
    this.scope('with_deleted', function(){
      this.setInternal('with_deleted', true);
    });
    
    this.beforeFind(function(){
      var with_deleted = this.getInternal('with_deleted') || false;
      
      if(!with_deleted && self.attributes.deleted_at){
        this.where({deleted_at: null});
      }
      return true;
    });
    
    this.destroy = function(options, callback){
      this.deleted_at = new Date();
      return this.save(options, callback);
    }
  }
};