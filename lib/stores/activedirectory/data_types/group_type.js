var GroupTypeBitmask = {
  BUILTIN_LOCAL_GROUP:            1,
  ACCOUNT_GROUP:                	2,
  RESOURCE_GROUP:	              	4,
  UNIVERSAL_GROUP:                8,
  APP_BASIC_GROUP:	              16,
  APP_QUERY_GROUP:              	32,
  SECURITY_ENABLED:	            	-2147483648,
};



exports.store = {
  mixinCallback: function(){

    this.addType('group_type', {
      read: function(value){
        if(typeof value === 'string') value = parseInt(value, 10);

        var obj = {};
        for(var attr_name in GroupTypeBitmask){
          obj[attr_name] = (value & GroupTypeBitmask[attr_name]) === GroupTypeBitmask[attr_name];
        }

        return obj;
      },

      write: function(value){
        if(!value) value = {};
        var bitmask = 0;
        for(var attr_name in GroupTypeBitmask){
          if(value[attr_name] === true) bitmask += GroupTypeBitmask[attr_name];
        }
        return bitmask;
      }

    }, {
      binary: true,
      operators:{
        default: 'eq',
        defaults: ['eq', 'not']
      }
    });

  }
}
