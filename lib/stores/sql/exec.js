/*
 * MODEL
 */
exports.model = {

  exec: function(callback){
    var self = this;
    var query = this.query;
    /*var conditions = this.getInternal('conditions');
  
    for(var i in conditions){
      this._addCondition(conditions[i]);
    }
  
    
    */
    
    this.callInterceptors('beforeFind', this, [query], function(okay){
      if(okay){
        console.log(query.toString());
        query.exec(function(err, resp) { 
          self.callInterceptors('afterFind', self, [resp], function(okay){
            callback(okay ? resp : null);
          });
        });
      }
    });
  
    return this;
  }
  
};