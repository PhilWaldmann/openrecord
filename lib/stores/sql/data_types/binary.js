var validator = require('validator');

exports.store = {

  mixinCallback: function(){
    
    this.addType('binary', {
      read: function(value){
        if(value === null) return null;
        return new Buffer(value, 'binary');
      },
      write: function(buffer){
        if(buffer === null) return null;
        return buffer.toString('binary');
      }
    }, {
      migration:'binary',
      extend: Buffer,
      operators:{
        defaults: ['eq', 'not']
      }
    });
            
  }
};
