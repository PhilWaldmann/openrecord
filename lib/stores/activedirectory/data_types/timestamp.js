var moment = require('moment');

exports.store = {
  mixinCallback: function(){    
    
    //Windows timestamp (100 nanosecond passed since 1.1.1601 00:00:00) e.g. 129822505817745000
    this.addType('timestamp', {
      read: function(value){
        if(value === null || value === '0') return null;
        return new Date(parseInt(value, 10) / 10000 - 11644473600000);
      },
      write: function(value){
        if(value === null) return null;
        return (11644473600000 + parseInt(moment(value).format('X'), 10) * 10000).toString();
      }
    },{
      operators:{
        default: 'eq',
        defaults: ['eq', 'gt', 'gte', 'lt', 'lte', 'not']
      }
    });
        
  }
}