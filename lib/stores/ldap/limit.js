var ldap = require('ldapjs');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){

    this.beforeFind(function(options){
      var limit = this.getInternal('limit');
      var offset = this.getInternal('offset');

      if(typeof limit == 'number'){
        //TODO: set limit options
      }else{
        options.controls = options.controls || [];
        options.controls.push(new ldap.PagedResultsControl({ value: { size: 100 } }));
      }

      //TODO: set offset options

      return true;
    }, -40);


  }
};
