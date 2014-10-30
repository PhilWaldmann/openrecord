var ldap = require('ldapjs');

var BASIC_FILTERS = {
  '=': ldap.EqualityFilter,
  '>=': ldap.GreaterThanEqualsFilter,
  '<=': ldap.LessThanEqualsFilter,
  'like': ldap.ApproximateMatchFilter
}



exports.applyConditions = function(conditions, options){
  
  if(options.filter) return;
  
  var tmp = options.filter = new ldap.AndFilter();

  for(var i = 0; i < conditions.length; i++){
    if(conditions[i].type == 'hash'){
      var name = conditions[i].field;
      var value = conditions[i].value;
      var operator = conditions[i].operator;
      
      if(BASIC_FILTERS[operator]){
        tmp.addFilter(new BASIC_FILTERS[operator]({
          attribute: name,
          value: value
        }));
      }
    }else{
      var query = conditions[i].query;
      var args = conditions[i].args;
      //TODO: put args into query
      
      var custom = ldap.parseFilter(query);
      
      if(conditions.length === 1){
        operator.filter = custom;
      }else{
        tmp.addFilter(custom);
      }
      
    }
    
  }
};