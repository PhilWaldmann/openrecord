exports.definition = {
  mixinCallback: function(){
    this.rdn_prefix = 'cn';
  },
  
  rdnPrefix: function(prefix){
    this.rdn_prefix = prefix;
  },
  
  dn: function(record){
    return this.rdn_prefix + '=' + record.username + ',' + record.parent_dn;
  }
};
