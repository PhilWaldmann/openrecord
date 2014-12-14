var Store = require('../store');

exports.utils = {
  
  sanitizeRelations: function(parent, relations, name_tree, through){
    var tmp = [];
  
    if(!name_tree) name_tree = [];
    if(!through) through = {};
    if(!(relations instanceof Array)) relations = [relations];
  
    for(var i = 0; i < relations.length; i++){
      if(typeof relations[i] == 'string'){
        var tmp_split = relations[i].split(':');
        var rel_name = tmp_split[0];
        var scope = tmp_split[1];
      
        var relation = parent.definition.relations[rel_name];
        if(relation){
          if(relation.through){

            var through_rel = {};
            through_rel[relation.through] = relation.relation;
          
            through.name = through.name || relation.relation;
            through.name_tree = through.name_tree || name_tree.concat(relation.name);
          
            tmp = tmp.concat(exports.utils.sanitizeRelations(parent, through_rel, name_tree, through));
          }else{
            tmp.push({
              relation:relation, 
              parent:parent,
              name_tree: name_tree.concat(relation.name),
              scope: scope
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
          if(scope){
            tmp.push({
              name_tree: name_tree.concat(parent.definition.getName()),
              scope: scope
            });
          }else{
            throw new Store.RelationNotFoundError(parent, relations[i]);
          }        
        }
      }else{
        if(relations[i] instanceof Array){
        
          tmp = tmp.concat(exports.utils.sanitizeRelations(parent, relations[i], name_tree, through));
        
        }else{

          for(var name in relations[i]){

            var tmp_split = name.split(':');
            var rel_name = tmp_split[0];
            var scope = tmp_split[1];
                   
            var relation = parent.definition.relations[rel_name];
            if(relation){
              if(relation.through){

                var through_rel = {};
                through_rel[relation.through] = {};
                through_rel[relation.through][relation.relation] = [relations[i][name]];
              
                through.name = through.name || relation.relation;
                through.name_tree = through.name_tree || name_tree.concat(relation.name);
              
                tmp = tmp.concat(exports.utils.sanitizeRelations(parent, through_rel, name_tree, through));
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
                  sub_relations: sub_relations,
                  scope: scope
                });
              
                if(through){
                  if(through.name == relation.name){
                    tmp[tmp.length - 1].as = through.name_tree;
                    through.name_tree = null;
                    through.name = null;
                  }          
                }
              
                if(!relation.polymorph){
                  tmp = tmp.concat(exports.utils.sanitizeRelations(relation.model, [relations[i][name]], name_tree.concat(relation.name), through));
                }              
              }
            }else{
              if(scope){
                tmp.push({
                  name_tree: name_tree.concat(parent.definition.getName()),
                  scope: scope
                });
              }else{
                throw new Store.RelationNotFoundError(parent, name);
              }
            }
          }
        
        }
      }          
    }
  
    return tmp;
  },


  sanitizeConditions: function(parent, conditions, name_tree, relation){
    var result = [];
  
    if(!name_tree) name_tree = [];
    if(!(conditions instanceof Array)) conditions = [conditions];
  
    for(var i = 0; i < conditions.length; i++){
    
      //raw conditions via string... ['string with conditions and placeholers', param1, param2, param3,...]
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
            return '?'; //use a questionmark a placeholder...
          });
        }
      
        return [{
          type: 'raw',
          query: query,
          args: args,
          name_tree: name_tree
        }];
      }
    
    
    
      //hash condtions
      if(conditions[i] instanceof Array){
      
        //call sanitizeConditions recursive
        result = result.concat(exports.utils.sanitizeConditions(parent, conditions[i], name_tree));
      
      }else{
            
        //if we use {login:'phil'} or {login_like:'phil'}
        for(var name in conditions[i]){
          
          if(conditions[i].hasOwnProperty(name)){
            var current_relation = parent.definition.relations[name];

            //if it's a relations e.g.: {posts:{title:'First post'}}
            if(current_relation){

              //sanitize the relation and call sanitizeConditions recursiv
              var rel = exports.utils.sanitizeRelations(parent, name, name_tree);
              rel = rel[rel.length - 1];
              result = result.concat(exports.utils.sanitizeConditions(rel.relation.model, [conditions[i][name]], rel.name_tree, current_relation));
                        
            
            }else{
              
              var operator = null;
              var value = conditions[i][name];            
              var attrs = parent.definition.attributes;
              
              //if it's a reference to another attribute - enhance it with additional information
              if(value && typeof value === 'object' && value.attribute){
                if(value.model){
                  value.name_tree = value.name_tree || name_tree.slice(0, -1);
                }else{
                  value.name_tree = value.name_tree || name_tree.slice();
                  
                  if(value.relation){
                    var pos = value.name_tree.lastIndexOf(value.relation);
                    if(pos !== -1){
                      value.name_tree = value.name_tree.slice(0, pos + 1);
                    }else{
                      value.name_tree = value.name_tree.concat(value.relation);
                    }
                  }
                }
                value.model = value.model || parent;               
              }
              
              //first check if there is an operator applied
              if(parent.definition.attributes[name]){
                
                //ignore the condition if the attribute's type does not have any operators
                if(!attrs[name].type.operators){ 
                  parent.definition.store.logger.warn("Can't find a default operator for attribute '" + name + "'");
                  continue;
                }
                
                //just the attribute name
                operator = attrs[name].type.operators.default; //use the default operator of that type

              }else{
                //it could be an unknown attribute or a known one with an operator applied
                var tmp = name.split('_');
                var op = [], tmp_name;
                
                while(tmp.length > 1 && !operator){
                  op.unshift(tmp.splice(-1));
                  tmp_name = tmp.join('_');
                  if(attrs[tmp_name]){
                    operator = op.join('_');
                  }
                }
                
                //ignore the condition if we could not find any defined attribute
                if(!operator){ 
                  parent.definition.store.logger.warn("Can't find attribute '" + name + "' on model '" + parent.definition.model_name + "'");
                  continue;
                }

                //ignore the condition if the attribute's type does not have any operators
                if(!attrs[tmp_name]){ 
                  parent.definition.store.logger.warn("Can't find any operator for attribute '" + tmp_name + "'");
                  continue;
                }
                      
                //ignore the condition if the attribute's type does not have any operators
                if(!attrs[tmp_name].type.operators){ 
                  parent.definition.store.logger.warn("Can't find any operator for attribute '" + tmp_name + "'");
                  continue;
                }
                
                //ignore the condition if the operator does not exist for the attribute type
                if(!attrs[tmp_name].type.operators[operator]){
                  parent.definition.store.logger.warn("Can't find operator '" + operator + "' for attribute '" + tmp_name + "' (" + attrs[tmp_name].type.name + ")");
                  continue;
                }
                                
                name = tmp_name;
              }

              result.push({
                type: 'hash',
                model: parent,
                name_tree: name_tree,
                attribute: name, 
                operator: operator,                 
                value: value
              });
              
            }
          }
        }
      }
    }

    return result;
  },


  reverseConditions: function(conditions){
    for(var i = 0; i < conditions.length; i++){
      if(conditions[i].value && conditions[i].value.attribute){
        //swap only attribute comparisons
        var tmp_name_tree = conditions[i].name_tree;
        var tmp_attribute = conditions[i].attribute;
        var tmp_model     = conditions[i].model;
        
        conditions[i].name_tree = conditions[i].value.name_tree;
        conditions[i].attribute = conditions[i].value.attribute;
        conditions[i].model     = conditions[i].value.model;
        
        conditions[i].value.name_tree = tmp_name_tree;
        conditions[i].value.attribute = tmp_attribute;
        conditions[i].value.model     = tmp_model;
        
        var attrs = conditions[i].model.definition.attributes;

        if(!attrs[conditions[i].attribute].type.operators[conditions[i].operator]){
          conditions[i].operator = attrs[conditions[i].attribute].type.operators.default;
        }
      }
    }

    return conditions;
  },


  nameTreeToRelation: function(name_tree){
    if(name_tree.length == 1){
      return name_tree[0];
    }
    var tmp = {}
    tmp[name_tree[0]] = exports.utils.nameTreeToRelation(name_tree.slice(1));
    return tmp;
  },

  nameTreeToCondition: function(name_tree, conditions){
    var tmp = {}
    if(name_tree.length == 1){
      tmp[name_tree[0]] = conditions;
      return tmp;
    }  
    tmp[name_tree[0]] = exports.utils.nameTreeToCondition(name_tree.slice(1), conditions);
    return tmp;  
  },


  nameTreeToNames: function(name, name_tree){
 
    if(name_tree.length === 1){
      name = name_tree[0];
    }
  
    if(name_tree.length === 2){
      name = name_tree[0] + '_' + name_tree[1];
    }

    if(name_tree.length > 2){
      var l = name_tree.length;
      name        = name_tree[l - 2] + '_' + name_tree[l - 1];
    }
  
    return name;
  }
  
};