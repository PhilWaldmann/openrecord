exports.definition = {
  mixinCallback: function(){
    this.rdn_prefix = 'cn';
  },
  
  rdnPrefix: function(prefix){
    this.rdn_prefix = prefix;
  },
  
  dn: function(record, parent){
    return this.rdn_prefix + '=' + record.username + ',' + parent;
  }
};


exports.record = {
  generateDN: function(){
    this[this.definition.dnAttribute] = this.definition.dn(this, this._parent_dn);
  },
  
  setParentDN: function(parent_dn){
    this._parent_dn = parent_dn;
    this.generateDN();
  }
}