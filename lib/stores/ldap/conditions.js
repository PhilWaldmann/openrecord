var Helper = require('./helper');
var Utils = require('../../utils');
var parseDN = require('ldapjs').parseDN;

//
//exports.store = {
//  mixinCallback: function(){
//    this.likePlaceholder = '';
//  }
//}
//
///*
// * DEFINITION
// */
//exports.definition = {
//  mixinCallback: function(){
//    var self = this;
//    this.beforeFind(function(options){
//      var conditions = this.getInternal('conditions') || [];
//
//      Helper.applyConditions(conditions, options);
//      
//      return true;
//    }, -70);
//    
//  }
//};


exports.model = {
  find: function(dn){
    var self = this.chain();
    
    if(typeof dn === 'string'){
      try{   
        parseDN(dn); //will throw an error if no valid dn given
        self.searchRoot(dn);
        self.searchScope('base');
        return self;
      }catch(e){
        //continue with normal find...
      }
    }
    
    return self.callParent(arguments);  
  }
}