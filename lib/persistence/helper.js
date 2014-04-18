var Store = require('../store');

exports.sanitizeRelations = function(parent, relations, name_tree, through){
  var tmp = [];
  
  if(!name_tree) name_tree = [];
  if(!through) through = {};
  if(!(relations instanceof Array)) relations = [relations];
  
  for(var i = 0; i < relations.length; i++){
    if(typeof relations[i] == 'string'){
      var relation = parent.definition.relations[relations[i]];
      if(relation){
        if(relation.through){

          var through_rel = {};
          through_rel[relation.through] = relation.relation;
          
          through.name = through.name || relation.relation;
          through.name_tree = through.name_tree || name_tree.concat(relation.name);
          
          tmp = tmp.concat(exports.sanitizeRelations(parent, through_rel, name_tree, through));
        }else{
          tmp.push({
            relation:relation, 
            parent:parent,
            name_tree: name_tree.concat(relation.name)
          });
          
          if(through){
            if(through.name == relation.name){
              tmp[tmp.length - 1].as = through.name_tree;
              through.name_tree = null;
              through.name = null;
            }          
          }
          
        }
         
      }else{
        throw new Store.RelationNotFoundError(parent, relations[i]);
      }
    }else{
      if(relations[i] instanceof Array){
        
        tmp = tmp.concat(exports.sanitizeRelations(parent, relations[i], name_tree, through));
        
      }else{

        for(var name in relations[i]){

          var relation = parent.definition.relations[name];
          if(relation){
            if(relation.through){

              var through_rel = {};
              through_rel[relation.through] = {};
              through_rel[relation.through][relation.relation] = [relations[i][name]];
              
              through.name = through.name || relation.relation;
              through.name_tree = through.name_tree || name_tree.concat(relation.name);
              
              tmp = tmp.concat(exports.sanitizeRelations(parent, through_rel, name_tree, through));
            }else{
              
              var sub_relations = null;
              
              if(relation.polymorph){
                sub_relations = relations[i][name];
                if(sub_relations instanceof Array && sub_relations.length == 1) sub_relations = sub_relations[0];
              }
              
              tmp.push({
                relation:relation, 
                parent:parent,
                name_tree: name_tree.concat(relation.name),
                sub: relations[i][name],
                sub_relations: sub_relations
              });
              
              if(through){
                if(through.name == relation.name){
                  tmp[tmp.length - 1].as = through.name_tree;
                  through.name_tree = null;
                  through.name = null;
                }          
              }
              
              if(!relation.polymorph){
                tmp = tmp.concat(exports.sanitizeRelations(relation.model, [relations[i][name]], name_tree.concat(relation.name), through));
              }              
            }
          }else{
            throw new Store.RelationNotFoundError(parent, name);
          }
        }
        
      }
    }          
  }
  
  return tmp;
};



var OPERATORS = {
  not: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  like: 'like',
  not_like: 'not like',
  between: 'between',
  ilike: 'ilike'
};


exports.sanitizeCondition = function(parent, conditions, name_tree){
  var result = [];
  
  if(!name_tree) name_tree = [];
  if(!(conditions instanceof Array)) conditions = [conditions];
  
  
  for(var i = 0; i < conditions.length; i++){
    if(typeof conditions[i] == 'string' && i === 0){
      //if we use something like ["login = ?", "phil"]
      var args = conditions.slice(1);
      var query = conditions[0];

      if(typeof args[0] == 'object' && !(args[0] instanceof Array)){
        //if we use ["login = :login", {login:"phil"}]
        var values = args[0];
        var tmp = [];        
        args = [];        
        query = query.replace(/\:(\w+)/g, function(res, field){
          args.push(values[field]);
          return '?';
        });
      }
      
      return [{
        type: 'raw',
        query: query,
        args: args,
        name_tree: name_tree
      }];
    }
    
    if(conditions[i] instanceof Array){
      result = result.concat(exports.sanitizeCondition(parent, conditions[i], name_tree));
    }else{
      //if we use {login:'phil'} or {login_like:'phil'}
      for(var name in conditions[i]){
        if(conditions[i].hasOwnProperty(name)){
          var relation = parent.definition.relations[name];
          if(relation){
            rel = exports.sanitizeRelations(parent, name, name_tree);
            rel = rel[rel.length - 1];
            result = result.concat(exports.sanitizeCondition(rel.relation.model, [conditions[i][name]], rel.name_tree));
          }else{
            var tmp = name.match(
              new RegExp('(.+?)(_(' + Object.keys(OPERATORS).join('|') + ')|)$', 'i')
            );

            var value = conditions[i][name];
            if(tmp[3] == 'like' || tmp[3] == 'not_like' || tmp[3] == 'ilike'){
              if(value instanceof Array){
                value = value.map(function(val){
                  return '%' + val + '%';
                });
              }else{
                value = '%' + value + '%';
              }                
            }

            result.push({
              type: 'hash',
              table: parent.definition.table_name,
              name_tree: name_tree,
              field: tmp[1], 
              operator: OPERATORS[tmp[3]] || '=',                 
              value: value ? parent.definition.cast(tmp[1], value) : value
            });
          }
        }
      }
    }
  }
  
  return result;
};




exports.nameTreeToRelation = function(name_tree){
  if(name_tree.length == 1){
    return name_tree[0];
  }
  var tmp = {}
  tmp[name_tree[0]] = exports.nameTreeToRelation(name_tree.slice(1));
  return tmp;
};

exports.nameTreeToCondition = function(name_tree, conditions){
  var tmp = {}
  if(name_tree.length == 1){
    tmp[name_tree[0]] = conditions;
    return tmp;
  }  
  tmp[name_tree[0]] = exports.nameTreeToCondition(name_tree.slice(1), conditions);
  return tmp;  
}