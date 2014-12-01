var ldap  = require('ldapjs');

exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    this.onFind(function(options, data, next){

      if(options.filter.filters.length === 0){
        options.filter = null;     
      }
      
      this.connection.search(options.root, options, options.controls || [], function(err, res){

        self.logger.info('Search ' + options.root + ' (Scope=' + options.scope + ', Filter=' + options.filter.toString() + ', Attributes=' + options.attributes);
        console.log('Search ' + options.root + ' (Scope=' + options.scope + ', Filter=' + options.filter.toString() + ', Attributes=' + options.attributes);

        if(err) data.error = err;
        
        
        var records = [];
      
        // get search resutls
        res.on('searchEntry', function(entry) {
          records.push(entry.object);
        });

        //finished search... 
        res.on('end', function(result) {
          data.result = records;
          next();          
        });

        res.on('error', function(err) {
          if(err instanceof ldap.NoSuchObjectError){
            return next()
          }
          data.error = err;
          next();
        });
        
      });
    });
  }
}


/*
 * MODEL
 */
exports.model = {
  
  getExecOptions: function(){
    return {
      filter:new ldap.AndFilter({filters: []})
    };
  }
  
};