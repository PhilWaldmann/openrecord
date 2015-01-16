var parseDN = require('ldapjs').parseDN;

exports.definition = {
  mixinCallback: function(){
    this.rdn_prefix = 'cn';
  },
  
  rdnPrefix: function(prefix){
    this.rdn_prefix = prefix;
  },
  
  dn: function(record){
    if(!record[this.rdn_prefix] && record.dn) return record.dn;
    return this.rdn_prefix + '=' + record[this.rdn_prefix] + ',' + record.parent_dn;
  }
};
