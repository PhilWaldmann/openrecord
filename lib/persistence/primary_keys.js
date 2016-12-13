var inflection = require('inflection');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;

    this.primary_keys = [];

    this.use(function(){
      for(var name in self.attributes){
        if(self.attributes[name].primary){
          self.primary_keys.push(name);
        }
      }
    }, 0);

  }
}
