exports.definition = {
  mixinCallback: function(){
    this.rdn_prefix = 'cn';
  },
  
  rdnPrefix: function(prefix){
    this.rdn_prefix = prefix;
  }
};