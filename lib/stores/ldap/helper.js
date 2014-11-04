var ldap = require('ldapjs');

var BASIC_FILTERS = {
  '=': ldap.EqualityFilter,
  '>=': ldap.GreaterThanEqualsFilter,
  '<=': ldap.LessThanEqualsFilter
}



exports.applyConditions = function(conditions, options){
  
  if(options.filter) return;
  
  var tmp = options.filter = new ldap.AndFilter();

  for(var i = 0; i < conditions.length; i++){
    if(conditions[i].type == 'hash'){
      var name = conditions[i].field;
      var value = conditions[i].value;
      var operator = conditions[i].operator;

      if(!(value instanceof Array)) value = [value];

      // equal, greaterThanEqla or lessThanEqual
      if(BASIC_FILTERS[operator]){
                
        var or = []
        for(var v = 0; v < value.length; v++){
          or.push(new BASIC_FILTERS[operator]({
            attribute: name,
            value: value[v].toString()
          }))
        }
        
        if(or.length > 0){
          tmp.addFilter(new ldap.OrFilter({filters: or}));
        }
        
        continue;
      }
      
      
      //subString
      if(operator === 'like'){
        var or = []
        for(var v = 0; v < value.length; v++){
          or.push(new ldap.SubstringFilter({
            attribute: name,
            any: [value[v]]
          }))
        }
        
        if(or.length > 0){
          tmp.addFilter(new ldap.OrFilter({filters: or}));
        }
        
        continue;
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