var ldap = require('ldapjs');

var BASIC_FILTERS = {
  '=': ldap.EqualityFilter,
  '>=': ldap.GreaterThanEqualsFilter,
  '<=': ldap.LessThanEqualsFilter,
  'like': ldap.SubstringFilter
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

        if(value instanceof Array && value.length === 1) value = value[0];
        
        if(value instanceof Array && operator !== 'like'){
          var or = []
          for(var v = 0; v < value.length; v++){
            or.push(new BASIC_FILTERS[operator]({
              attribute: name,
              value: value[v],
              any: value[v] //substring filter uses any...
            }))
          }
          
          tmp.addFilter(new ldap.OrFilter({filters: or}));
          
        }else{
          
          if(operator === 'like' && !(value instanceof Array)) value = [value];
          
          tmp.addFilter(new BASIC_FILTERS[operator]({
            attribute: name,
            value: value,
            any: value //substring filter uses any...
          }));
        }        
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