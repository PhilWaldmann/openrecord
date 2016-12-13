var parseDN = require('ldapjs').parseDN;
var Utils = require('../../utils');

exports.model = {
  find: function(dn){
    var self = this.chain();

    if(typeof dn === 'string'){
      try{
        parseDN(dn); //will throw an error if no valid dn given //TODO: change to isDN() in next verion of ldapjs
        self.searchRoot(dn);
        self.searchScope('base');
        return self;
      }catch(e){
        //continue with normal find...
      }
    }

    return self.callParent.apply(self, Utils.args(arguments));
  }
}
