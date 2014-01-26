var inflection = require('inflection');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){    
    this.on('finished', function(){
      this.primary_keys = [];
      for(var name in this.attributes){
        if(this.attributes[name].primary){
          this.primary_keys.push(name);
        }
      }
      
    });
    
  }
}

