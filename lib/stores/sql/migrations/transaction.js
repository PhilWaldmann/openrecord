exports.migration = {
  startTransaction: function(){
    var self = this;
    
    //knex currently does not support transactions on the schema builders
    /*
    this.queue.push(function(next){
      self.connection.transaction(function(transaction){
        console.log('STARTED');
        self.transaction = transaction;
        next();
      }).catch(function(e){
        //TODO: do something with rollback message!?!
      });      
    });
    */
    
    return this;
  },
  
  
  
  commit: function(){
    var self = this;
    
    /*
    this.queue.push(function(next){
      console.log('COMMIT');
      self.transaction.commit(next);
    });
    */
    
    return this;
  },
  
  
  //Rollback is instant
  rollback: function(msg){    
    if(this.transaction){
      this.transaction.rollback(msg);    
    }
  }
}