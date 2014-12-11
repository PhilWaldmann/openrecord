var moment = require('moment');

exports.store = {

  mixinCallback: function(){
    
    this.addType('time', {
      read: function(value){
        return value;
      },
      input: function(value){
        if(value === null) return null;
        var dt;
        
        if(typeof value === 'string'){
          dt = moment('2000-01-01 ' + value)
        }else{
          dt = moment(value);
        }
        
        return dt.format('HH:mm:ss');        
      },
      write: function(value){
        return value;
      },
      output: function(value){
        return value;
      }
    }, {
      migration:'time',
      operators:{
        defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
      }
    });
            
  }
};
