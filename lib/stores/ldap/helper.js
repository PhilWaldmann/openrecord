var ldap = require('ldapjs');

var BetweenFilter = function(config){
  if(!config) return;
  return new ldap.AndFilter({
    filters: [
      new ldap.GreaterThanEqualsFilter({attribute: config.attribute, value: config.original[0]}),
      new ldap.LessThanEqualsFilter({attribute: config.attribute, value: config.original[1]})
    ]
  });
};


var BASIC_FILTERS = {
  '=': ldap.EqualityFilter,
  '!=': ldap.EqualityFilter, //but with a NOT filter (See NOT_OPERATORS)
  '>': ldap.LessThanEqualsFilter, //but with a NOT filter (See NOT_OPERATORS)
  '>=': ldap.GreaterThanEqualsFilter,
  '<': ldap.GreaterThanEqualsFilter, //but with a NOT filter (See NOT_OPERATORS)
  '<=': ldap.LessThanEqualsFilter,
  'like': null,
  'not like': null, //but with a NOT filter (See NOT_OPERATORS)
  'between': BetweenFilter,
  'ilike': null,
  'is': ldap.PresenceFilter, //but with a NOT filter (See NOT_OPERATORS)
  'is not': ldap.PresenceFilter 
};

var UNMODIFIED_OPERATORS = ['between', 'is', 'is not'];
var NOT_OPERATORS = ['!=', '>', '<', 'not like', 'is'];

exports.applyConditions = function(conditions, options){
  
  if(options.filter) return;
  
  var tmp = options.filter = new ldap.AndFilter();

  for(var i = 0; i < conditions.length; i++){
    if(conditions[i].type == 'hash'){
      var name = conditions[i].field;
      var value = conditions[i].value;
      var operator = conditions[i].operator;

      if(value instanceof Array && value.length === 0){
        value = null;
      }

      if(value === null && operator !== 'is not'){
        operator = 'is';
      }

      if(!(value instanceof Array) || UNMODIFIED_OPERATORS.indexOf(operator) !== -1) value = [value];

      // equal, greaterThanEqla or lessThanEqual
      if(BASIC_FILTERS[operator]){
                
        var or = []
        for(var v = 0; v < value.length; v++){
          or.push(new BASIC_FILTERS[operator]({
            attribute: name,
            value: value[v] ? value[v].toString() : null,
            original: value[v]
          }))
        }
        
        if(or.length > 0){
          filter = or[0];
          
          if(or.length > 1){
            filter = new ldap.OrFilter({filters: or});
          }
          
          if(NOT_OPERATORS.indexOf(operator) != -1){
            filter = new ldap.NotFilter({filter:filter});
          }
          tmp.addFilter(filter);
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