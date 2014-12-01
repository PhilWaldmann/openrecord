var moment = require('moment');

exports.store = {

  mixinCallback: function(){
    
    this.addType('date', {
      read: function(value){
        if(value === null) return null;
        return moment(value).format('YYYY-MM-DD');
      },
      input: function(value){
        if(value === null) return null;
        return moment(value).format('YYYY-MM-DD');
      },
      write: function(value){
        return value;
      },
      output: function(value){
        return value;
      }
    }, {
      migration:'date',
      operators:{
        defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
      }
    });
            
  }
};
