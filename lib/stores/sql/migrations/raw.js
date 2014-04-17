exports.migration = {
  
  raw: function(sql){
    var self = this;
    
    this.queue.push(function(next){
      //Currently knex does not support schema transactions //.transacting(self.transaction)
      self.connection.raw(sql).then(function(){
        next();
      }, function(err){
        next(err);
      });
    });
        
    return this;
  }
};