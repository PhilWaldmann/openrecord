var async = require('async');

var Utils = require('../utils');
var Helper = require('../persistence/helper');

/*
 * MODEL
 */
exports.model = {
  /**
   * Include relations into the result
   * @section Model/Find
   * @method include
   * @param {array} includes - array of relation names to include
   * or
   * @param {object} includes - for nested includes use objects
   *
   * @see Model.exec
   *
   * @return {Model}
   */
  include: function(){
    var self = this.chain();
    var relations = Helper.sanitizeRelations(self, Utils.args(arguments));
    
    
    for(var i = 0; i < relations.length; i++){
      self.addInternal('includes', {
        relation:relations[i].relation, 
        parent:relations[i].parent,
        name_tree: relations[i].name_tree,
        sub_includes: relations[i].sub_relations,
        as: relations[i].as,
        scope: relations[i].scope
      });
    }
    
    return self;
  }
};



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){

    this.beforeFind(function(){
      var includes = this.getInternal('includes') || [];
      var conditions = this.getInternal('conditions') || [];
      
      for(var i in includes){
        var relation = includes[i].relation;
        var tmp = [];
        
        for(var c in conditions){
          if(conditions[c].name_tree.indexOf(relation.name) != -1){            
            tmp.push(conditions[c]);
            delete conditions[c];
          }
        }
                
        includes[i].conditions = tmp;
        
      }
      
      return true;
    }, -10);
    
    
    
    
    
    this.afterFind(function(data, next){
      var self = this;
      var records = data.result;
      var includes = this.getInternal('includes') || [];
      
      if(records.length === 0){
        return next(true);
      }
      
      var base = {};
      
      var toNestedIncludes = function(name_tree){
        if(name_tree.length == 1) return name_tree[0];
        var tmp = {};
        tmp[name_tree.shift()] = toNestedIncludes(name_tree);
        return tmp;
      };
      
      
      //find base models + includes     
      for(var i in includes){
        var relation = includes[i].relation;
        var name = includes[i].name_tree[0];
        
        if(includes[i].name_tree.length == 1){
          var Models = [];
          
          if(includes[i].scope && !relation){
            //scope on the current model. e.g. :totalCount
            
            base[name] = {
              includes:[],
              custom_includes: [],
              conditions: [],
              custom_conditions: [],
              records: [],
              model: [self.model],
              scope: includes[i].scope
            };
            
            
          }else{
            if(relation.polymorph){
              for(var r = 0; r < records.length; r++){
                var Model = this.definition.store.Model(records[r][relation.type_key]);
                if(Model && Models.indexOf(Model) == -1){
                  Models.push(Model);
                }
              }
            }else{
              Models.push(relation.model);
            }
          
            for(var m = 0; m < Models.length; m++){
              var record_map = {};
              var condition = {};
              condition[relation.foreign_key] = [];
          
              var tmp = relation.conditions[relation.name];

              for(var c in tmp){
                if(tmp.hasOwnProperty(c)){
                  condition[c] = tmp[c];
                }
              }
            
              //build conditions
              for(var r in records){
                var id = records[r][relation.primary_key];
                if(id && (!relation.polymorph || (relation.polymorph && records[r][relation.type_key] == Models[m].definition.model_name))){

                  if(condition[relation.foreign_key].indexOf(id) === -1){
                    condition[relation.foreign_key].push(id);
                  }
                  record_map[id] = record_map[id] || [];
                  record_map[id].push(records[r]);
                }
              }

              if(condition[relation.foreign_key].length > 0){ //check if there are any ids

                if(!base[name]){
                  base[name] = {
                    includes:[],
                    custom_includes: includes[i].sub_includes || [],
                    conditions: [],
                    custom_conditions: includes[i].conditions,
                    records: [],
                    model: [],
                    relation: relation,
                    scope: includes[i].scope
                  };
                }
              
                base[name].conditions.push(condition);
                base[name].records.push(record_map);
                base[name].model.push(Models[m]);
                            
              }
            }
          }
          
        }else{
          if(base[name]){
            base[name].includes.push({
              relation:includes[i].relation, 
              parent:includes[i].parent,
              name_tree: includes[i].name_tree.slice(1),
              sub_includes: includes[i].sub_includes,
              as: (includes[i].as) ? includes[i].as.slice(1) : includes[i].as
            });
                    
            if(includes[i].as && includes[i].as.length === 1){
              base[name].as = includes[i].as[0];
              base[name].take = includes[i].name_tree.slice(1);
            }
          }
        }
      }
      
      
      //create async.parallel() calls array with "subselects"
      var calls = [];
      for(var i in base){
        for(var n = 0; n < base[i].model.length; n++){
          (function(base, n){
          
            var relation = base.relation;
          
            calls.push(function(next){
              //"subselect"
              var Chain = base.model[n].where(base.conditions[n])

              for(var c = 0; c < base.includes.length; c++){
                Chain.addInternal('includes', base.includes[c]);
              }
            
              for(var c = 0; c < base.custom_conditions.length; c++){
                Chain.addInternal('conditions', base.custom_conditions[c]);
              }
              
              if(base.scope && typeof Chain[base.scope] === 'function'){
                Chain[base.scope](base.scope_attributes);
              }
              
              if(self.getInternal('as_json')){
                Chain.asJson();
              }

              Chain.include(base.custom_includes);
              
              Chain.exec(function(sub_records){
                
                if(base.scope){
                  var var_name = '$' + base.scope;
                  
                  if(base.relation){
                    var_name = base.relation.name + '$'+ base.scope
                  }
                  
                  self[var_name] = sub_records;
                }else{
                  //put sub_records into base models
                  for(var i = 0; i < sub_records.length; i++){
                    if(relation.polymorph){
                      var as_json = self.getInternal('as_json');
                      if(!as_json){
                        //create a model, but only for polymoph relations.
                        sub_records[i] = base.model[n].new(sub_records[i]);
                      }
                    }
                  
                    var records = base.records[n][sub_records[i][relation.foreign_key]];
                    for(var r in records){
                      if(base.as && base.take){
                        records[r][base.as] = records[r][base.as] || [];
                        var sr = sub_records[i][base.take[0]];
                    
                        for(var t = 1; t < base.take.length; t++){
                          sr = sr[base.take[t]];
                        }
                        records[r][base.as].push(sr);
                      }else{
                        records[r][relation.name] = records[r][relation.name] || [];
                        records[r][relation.name].push(sub_records[i]);
                      }
                    }
                  }
                }
                
                
                next(null);
              });
            });
          
          })(base[i], n);
        }
      }
      
      if(calls.length == 0){
        return next(true);
      }
      
      async.parallel(calls, function(){
        next(true);
      });
      
      
      
    }, 80);
    
  }
};