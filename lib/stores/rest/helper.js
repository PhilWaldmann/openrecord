var url = require('url');

exports.applyConditions = function(conditions, options){
  
  for(var i in conditions){
    if(conditions[i].type == 'hash'){
      var name = conditions[i].field;
      var value = conditions[i].value;
      var operator = conditions[i].operator;
      
      if(operator == '='){
        options.params[name] = value;
      }
    }
  }
};




exports.applyParams = function(options, primary_keys){
  
  var params = options.params;
  var path = options.path;
  
  path = options.path.replace(/:(\w+)/, function(match, param){
    if(params[param]){
      var tmp = params[param];
      delete params[param]
      return tmp;
    }
    return match;
  })

  options.path = url.format({
    pathname: path,
    query: params
  });
};