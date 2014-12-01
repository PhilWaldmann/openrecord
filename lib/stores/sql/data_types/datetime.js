var moment = require('moment');

exports.store = {

  mixinCallback: function(){
    
    this.addType('datetime', function(value){
      if(value === null) return null;
      return moment(value).toDate();
    }, {
      migration:'datetime',
      operators:{
        defaults: ['eq', 'not', 'gt', 'gte', 'lt', 'lte', 'between']
      }
    });
            
  }
};
