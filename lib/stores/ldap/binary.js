//add the ;binary flag to ldapjs
exports.definition = {
  
  mixinCallback: function(){  
    this.beforeFind(function(options){
      var binary = [];
      
      for(var name in this.definition.attributes){
        if(this.definition.attributes.hasOwnProperty(name)){
          var attr = this.definition.attributes[name];
          
          if(attr.type.binary){
            var pos = options.attributes.indexOf(name);
            if(pos != -1){
              options.attributes[pos] += ';binary';
              binary.push(name);
            }
          }
        }
      }
      
      this.setInternal('binary_attributes', binary);
            
    }, 50);
    
    
    this.afterFind(function(options){
      var records = options.result;
      var binary = this.getInternal('binary_attributes');
      
      for(var i = 0; i < binary.length; i++){
        var attr = binary[i];
        for(var r = 0; r < records.length; r++){
          if(records[r][attr + ';binary']){
            records[r][attr] = records[r][attr + ';binary'];
            delete records[r][attr + ';binary'];
          }
        }
      }
            
    }, 150);
  }
}