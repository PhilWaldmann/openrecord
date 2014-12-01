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
          //from http://www.timlabonne.com/2013/07/parsing-a-time-string-with-javascript/
          dt = moment();
        
          var time = value.match(/(\d+)(?::(\d\d))?\s*(p?)/i);
          if (!time) {
              return null;
          }
          var hours = parseInt(time[1], 10);
          if (hours == 12 && !time[3]) {
              hours = 0;
          }
          else {
              hours += (hours < 12 && time[3]) ? 12 : 0;
          }
 
          dt.hours(hours);
          dt.minutes(parseInt(time[2], 10) || 0);
          dt.seconds(0, 0);
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
