exports.utils = {

  sanitizeRelations: function(parent, relations, nameTree, through){
    const Store = require('../store')
    var tmp = []

    if(!nameTree) nameTree = []
    if(!through) through = {}
    if(!Array.isArray(relations)) relations = [relations]

    for(var i = 0; i < relations.length; i++){
      if(typeof relations[i] === 'string'){
        var tmpSplit = relations[i].split(':')
        var relName = tmpSplit[0]
        var scope = tmpSplit[1]

        var relation = parent.definition.relations[relName]
        if(relation){
          if(relation.through){
            var throughRel = {}
            throughRel[relation.through] = relation.relation

            through.name = through.name || relation.relation
            through.name_tree = through.name_tree || nameTree.concat(relation.name)

            tmp = tmp.concat(exports.utils.sanitizeRelations(parent, throughRel, nameTree, through))
          }else{
            tmp.push({
              relation: relation,
              parent: parent,
              name_tree: nameTree.concat(relation.name),
              scope: scope
            })

            if(through){
              if(through.name === relation.name){
                tmp[tmp.length - 1].as = through.name_tree
                through.name_tree = null
                through.name = null
              }
            }
          }
        }else{
          if(scope){
            tmp.push({
              name_tree: nameTree.concat(parent.definition.getName()),
              scope: scope
            })
          }else{
            throw new Store.RelationNotFoundError(parent, relations[i])
          }
        }
      }else{
        if(Array.isArray(relations[i])){
          tmp = tmp.concat(exports.utils.sanitizeRelations(parent, relations[i], nameTree, through))
        }else{
          for(var name in relations[i]){
            tmpSplit = name.split(':')
            relName = tmpSplit[0]
            scope = tmpSplit[1]

            var args = []

            relation = parent.definition.relations[relName]
            if(relation){
              if(relations[i][name].$args){
                args = relations[i][name].$args
                delete relations[i][name].$args

                if(!Array.isArray(args) && typeof args === 'object'){
                  if(relation.scope && relation.model[relation.scope] && relation.model[relation.scope].options){
                    var argsMapping = relation.model[relation.scope].options.args_mapping

                    if(argsMapping){
                      args = argsMapping.map(function(name){
                        return args[name]
                      })
                    }else{
                      args = [args]
                    }
                  }
                }
              }


              if(relation.through){
                throughRel = {}
                throughRel[relation.through] = {}
                throughRel[relation.through][relation.relation] = [relations[i][name]]

                through.name = through.name || relation.relation
                through.name_tree = through.name_tree || nameTree.concat(relation.name)

                tmp = tmp.concat(exports.utils.sanitizeRelations(parent, throughRel, nameTree, through))
              }else{
                var subRelations = null

                if(relation.polymorph){
                  subRelations = relations[i][name]
                  if(Array.isArray(subRelations) && subRelations.length === 1) subRelations = subRelations[0]
                }

                tmp.push({
                  relation: relation,
                  parent: parent,
                  name_tree: nameTree.concat(relation.name),
                  sub: relations[i][name],
                  sub_relations: subRelations,
                  scope: scope,
                  args: args
                })

                if(through){
                  if(through.name === relation.name){
                    tmp[tmp.length - 1].as = through.name_tree
                    through.name_tree = null
                    through.name = null
                  }
                }

                if(!relation.polymorph){
                  tmp = tmp.concat(exports.utils.sanitizeRelations(relation.model, [relations[i][name]], nameTree.concat(relation.name), through))
                }
              }
            }else{
              if(scope){
                tmp.push({
                  name_tree: nameTree.concat(parent.definition.getName()),
                  scope: scope
                })
              }else{
                throw new Store.RelationNotFoundError(parent, name)
              }
            }
          }
        }
      }
    }

    return tmp
  },


  sanitizeConditions: function(parent, conditions, nameTree, relation){
    var result = []

    if(!nameTree) nameTree = []
    if(!Array.isArray(conditions)) conditions = [conditions]

    for(var i = 0; i < conditions.length; i++){
      // raw conditions via string... ['string with conditions and placeholers', param1, param2, param3,...]
      if(typeof conditions[i] === 'string' && i === 0){
        // if we use something like ["login = ?", "phil"]
        var args = conditions.slice(1)
        var query = conditions[0]

        if(typeof args[0] === 'object' && !Array.isArray(args[0])){
          // if we use ["login = :login", {login:"phil"}]
          var values = args[0]
          var tmp = []
          args = []
          query = query.replace(/:(\w+)/g, function(res, field){
            args.push(values[field])
            return '?' // use a questionmark as a placeholder...
          })
        }

        return [{
          type: 'raw',
          query: query,
          args: args,
          name_tree: nameTree
        }]
      }



      // hash conditions
      if(Array.isArray(conditions[i])){
        // call sanitizeConditions recursive
        result = result.concat(exports.utils.sanitizeConditions(parent, conditions[i], nameTree))
      }else{
        // if we use {login:'phil'} or {login_like:'phil'}
        for(var name in conditions[i]){
          if(conditions[i].hasOwnProperty(name)){
            var currentRelation = parent.definition.relations[name]

            // if it's a relations e.g.: {posts:{title:'First post'}}
            if(currentRelation){
              // sanitize the relation and call sanitizeConditions recursiv
              var rel = exports.utils.sanitizeRelations(parent, name, nameTree)
              rel = rel[rel.length - 1]
              result = result.concat(exports.utils.sanitizeConditions(rel.relation.model, [conditions[i][name]], rel.name_tree, currentRelation))
            }else{
              var operator = null
              var value = conditions[i][name]
              var attrs = parent.definition.attributes

              // if it's a reference to another attribute - enhance it with additional information
              if(value && typeof value === 'object' && value.attribute){
                if(value.model){
                  value.name_tree = value.name_tree || nameTree.slice(0, -1)
                }else{
                  value.name_tree = value.name_tree || nameTree.slice()

                  if(value.relation){
                    var pos = value.name_tree.lastIndexOf(value.relation)
                    if(pos !== -1){
                      value.name_tree = value.name_tree.slice(0, pos + 1)
                    }else{
                      value.name_tree = value.name_tree.concat(value.relation)
                    }
                  }
                }
                value.model = value.model || parent
              }

              // first check if there is an operator applied
              if(parent.definition.attributes[name]){
                // ignore the condition if the attribute's type does not have any operators
                if(!attrs[name].type.operators){
                  parent.definition.store.logger.warn("Can't find a default operator for attribute '" + name + "'")
                  continue
                }

                // just the attribute name
                operator = attrs[name].type.operators.default // use the default operator of that type
              }else{
                // it could be an unknown attribute or a known one with an operator applied
                tmp = name.split('_')
                var op = []
                var tmpName

                while(tmp.length > 1 && !operator){
                  op.unshift(tmp.splice(-1))
                  tmpName = tmp.join('_')
                  if(attrs[tmpName]){
                    operator = op.join('_')
                  }
                }

                // ignore the condition if we could not find any defined attribute
                if(!operator){
                  if(process.env.NODE_ENV !== 'test') parent.definition.store.logger.warn("Can't find attribute '" + name + "' on model '" + parent.definition.model_name + "'")
                  continue
                }

                // ignore the condition if the attribute's type does not have any operators
                if(!attrs[tmpName]){
                  if(process.env.NODE_ENV !== 'test') parent.definition.store.logger.warn("Can't find any operator for attribute '" + tmpName + "'")
                  continue
                }

                // ignore the condition if the attribute's type does not have any operators
                if(!attrs[tmpName].type.operators){
                  if(process.env.NODE_ENV !== 'test') parent.definition.store.logger.warn("Can't find any operator for attribute '" + tmpName + "'")
                  continue
                }

                // ignore the condition if the operator does not exist for the attribute type
                if(!attrs[tmpName].type.operators[operator]){
                  if(process.env.NODE_ENV !== 'test') parent.definition.store.logger.warn("Can't find operator '" + operator + "' for attribute '" + tmpName + "' (" + attrs[tmpName].type.name + ')')
                  continue
                }

                name = tmpName
              }

              result.push({
                type: 'hash',
                model: parent,
                name_tree: nameTree,
                attribute: name,
                operator: operator,
                value: value
              })
            }
          }
        }
      }
    }

    return result
  },


  reverseConditions: function(conditions){
    for(var i = 0; i < conditions.length; i++){
      if(conditions[i].value && conditions[i].value.attribute){
        // swap only attribute comparisons
        var tmpNameTree = conditions[i].name_tree
        var tmpAttribute = conditions[i].attribute
        var tmpModel = conditions[i].model

        conditions[i].name_tree = conditions[i].value.name_tree
        conditions[i].attribute = conditions[i].value.attribute
        conditions[i].model = conditions[i].value.model

        conditions[i].value.name_tree = tmpNameTree
        conditions[i].value.attribute = tmpAttribute
        conditions[i].value.model = tmpModel

        var attrs = conditions[i].model.definition.attributes

        if(!attrs[conditions[i].attribute].type.operators[conditions[i].operator]){
          conditions[i].operator = attrs[conditions[i].attribute].type.operators.default
        }
      }
    }

    return conditions
  },


  nameTreeToRelation: function(nameTree){
    if(nameTree.length === 1){
      return nameTree[0]
    }
    var tmp = {}
    tmp[nameTree[0]] = exports.utils.nameTreeToRelation(nameTree.slice(1))
    return tmp
  },

  nameTreeToCondition: function(nameTree, conditions){
    var tmp = {}
    if(nameTree.length === 1){
      tmp[nameTree[0]] = conditions
      return tmp
    }
    tmp[nameTree[0]] = exports.utils.nameTreeToCondition(nameTree.slice(1), conditions)
    return tmp
  },


  nameTreeToNames: function(name, nameTree){
    if(nameTree.length === 1){
      name = nameTree[0]
    }

    if(nameTree.length === 2){
      name = nameTree[0] + '_' + nameTree[1]
    }

    if(nameTree.length > 2){
      var l = nameTree.length
      name = nameTree[l - 2] + '_' + nameTree[l - 1]
    }

    return name
  }

}
