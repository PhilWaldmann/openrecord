var Utils = require('../utils');

exports.definition = {
  mixinCallback: function(){
    var tmp = [];
    var self = this;
    
    this.use(function(){
      //get all current property names
      Utils.loopProperties(this, function(name, value){
        tmp.push(name);
      });
    });
    
        
    this.on('finished', function(){
      //an now search for new ones == instance methods for our new model class
            
      Utils.loopProperties(self, function(name, value){
        if(tmp.indexOf(name) == -1){
          self.instanceMethods[name] = value;
          delete self[name];
        }
      });
    })
  }
}