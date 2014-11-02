var async = require('async');

var Utils = require('../utils');
var Helper = require('../persistence/helper');

/*
 * MODEL
 */
exports.model = {
  /**
   * Include relations into the result
   * @class Model
   * @method include
   * @param {array} includes - array of relation names to include
   * @or
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
      var processed = this.getInternal('includes_processes');

      if(processed) return true;


      var processed_relations = [];
      var include_tree = {};
      for(var i = 0; i < includes.length; i++){
        if(includes[i]){
          
          var relation = includes[i].relation;
          var tmp = [];
        
          if(relation){
          
            //if there are multiple includes of the same relation - only take one
            if(processed_relations.indexOf(relation.name) !== -1){
              includes.splice(i, 1);
              i--
              continue;
            }
          
            processed_relations.push(relation.name);
          
            //add all conditions which relate to the included relation
            for(var c = 0; c < conditions.length; c++){
              if(conditions[c] && conditions[c].name_tree.indexOf(relation.name) != -1){            
                tmp.push(conditions[c]);
                delete conditions[c];
              }
            }
                
            includes[i].conditions = tmp;
            
            //convert the flatt includes list into a tree like structure
            var pos = includes[i].name_tree.length - 1;
            var parent_name;
            var parent;
        
            include_tree[includes[i].name_tree.join('.')] = includes[i];
        
            do{
              parent_name = includes[i].name_tree.slice(0, pos).join('.');
              parent = include_tree[parent_name];
              pos--;
            }while(!parent && pos > 0)
                
            if(parent){
                
              parent.child_includes = parent.child_includes || [];
              parent.child_includes.push(includes[i]);
              
              if(includes[i].as){
                var base_parent = include_tree[includes[i].name_tree[0]];
                var as = includes[i].as[0];

                if(includes[i].as.length > 1){
                  as = includes[i].as[includes[i].as.length - 1];
                  base_parent = include_tree[includes[i].name_tree.slice(0, includes[i].name_tree.length -1).join('.')];
                }
                
                if(base_parent){
                  var tmp = {}
                  tmp[as] = includes[i].name_tree.slice(2)
                  base_parent.take = tmp;
                }                    
              }
              
              includes[i].name_tree.splice(0, 1);
              
              includes.splice(i, 1);
              i--;
            }
                  
          }
          
        }else{
          //just to make sure everything will go smooth - remove empty objects
          includes.splice(i, 1);
          i--;
        }
        
      }
      

      this.setInternal('includes_processes', true);
      
      return true;
    }, -10);
    
    
    
    
    
    this.afterFind(function(data, next){
      var self = this;
      var records = data.result;
      var includes = self.getInternal('includes') || [];
            
      var base = {};
      
      /*
      TODO: 
      1 build include tree based on the name_tree attributes
      2 loop + build function array for async.parallel()
      3 inside every function there is the calculation of that include via:
        beforeInclude (build conditions, add joins...)
        onInclude (set condition, joins, includes, ect...)
        afterInclude (add results to records...)
      4 afterInclude class async next()
      */
      
      var calls = []

      for(var i = 0; i < includes.length; i++){
        var relation = includes[i].relation;
        var Models = [];
        
        //we dont need to do anything if we dont have any records
        if(records.length === 0 && !includes[i].scope){
          continue;
        }
        
        
        //get all the models... only polymophic relations could have more than one model...
        if(relation.polymorph){
          for(var r = 0; r < records.length; r++){
            var Model = self.definition.store.Model(records[r][relation.type_key]);
            if(Model && Models.indexOf(Model) == -1){
              Models.push(Model);
            }
          }
        }else{
          Models.push(relation.model || self.model);
        }
        
        
        //loop over all models per include and create an async task for it...
        for(var m = 0; m < Models.length; m++){
          
          
          //the async task...
          (function(include, Model){
            calls.push(function(done){

              var Chain = Model.asJson();
            
              //add child includes
              if(include.child_includes){
                Chain.addInternal('includes', include.child_includes);
              }
              
            
              //add polymorph/through includes
              if(include.sub_includes){
                Chain.include(include.sub_includes);
              }
              
            
              var cache = {};
            
              self.callInterceptors('beforeInclude', [Chain, records, include, cache, Model, data], function(okay){
                if(okay){

                  Chain.exec(function(result){

                    self.callInterceptors('afterInclude', [result, records, include, cache, Model, data], function(){
                      done();
                    });
                    
                  }).catch(function(err){
                    done(err)
                  });
            
            
                }else{
                  done();
                }
              });
            
            
            });
          })(includes[i], Models[m]);
          
          
        }
                
      }
      
      
      if(calls.length == 0){
        return next();
      }
      
      async.parallel(calls, function(err){
        next(err);
      });
      return;
      
      
      
      //find base models + includes     
      for(var i in includes){
        var relation = includes[i].relation;
        var name = includes[i].name_tree[0];
        
        if(includes[i].name_tree.length == 1){
          var Models = [];
          
          if(includes[i].scope && !relation){
            //scope on the current model. e.g. :totalCount
            
            base[name] = {
              includes: [],
              custom_includes: [],
              conditions: [],
              custom_conditions: self.getInternal('conditions') || [],
              records: [],
              model: [self.model],
              scope: includes[i].scope,
              joins: self.getInternal('joins') || []
            };
            
            
          }else{
            
            if(records.length === 0){
              continue;
            }
            
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
                    scope: includes[i].scope,
                    joins: []
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
              as: (includes[i].as) ? includes[i].as.slice(1) : includes[i].as,
              joins: []
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
                    
              for(var c = 0; c < base.joins.length; c++){
                Chain.addInternal('joins', base.joins[c]);
              }
              
                          
              for(var c = 0; c < base.custom_conditions.length; c++){
                Chain.addInternal('conditions', base.custom_conditions[c]);
              }
              
              if(base.scope && typeof Chain[base.scope] === 'function'){
                Chain[base.scope](base.scope_attributes);//TODO: where do they come from?            
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
                      //create a model, but only for polymoph relations.
                      sub_records[i] = base.model[n].new(sub_records[i]);
                    }
                  
                    var records = base.records[n][sub_records[i][relation.foreign_key]];
                    for(var r in records){
                      if(base.as && base.take){
                        //TODO: check relation type as well (see below..)
                        records[r][base.as] = records[r][base.as] || [];
                        var sr = sub_records[i][base.take[0]];
                    
                        for(var t = 1; t < base.take.length; t++){
                          sr = sr[base.take[t]];
                        }
                        records[r][base.as].push(sr);
                      }else{
                        if(base.relation.type === 'has_many'){
                          records[r][relation.name] = records[r][relation.name] || [];
                          records[r][relation.name].push(sub_records[i]);
                        }else{
                          records[r][relation.name] = records[r][relation.name] || sub_records[i];
                        }
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
    
    
    
    
    
    
    
    
    this.beforeInclude(function(Chain, records, include, cache){
            
      //add include conditions
      if(include.conditions){
        Chain.addInternal('conditions', include.conditions);
      }
      
      //console.log('-----------');
      //console.log('Include:', include.name_tree, include.take);
      //console.log('Records:', records);
      //console.log('-----v-----');
      
      var relation = include.relation;      
      var record_map = cache.record_map = cache.record_map || {};
      
      //build conditions by primary and foreign_key
      if(relation.primary_key && relation.foreign_key){
        
        if(records.length === 0) return 'STOP';
        
        var condition = {};
        condition[relation.foreign_key] = [];
        
        for(var i = 0; i < records.length; i++){
          var id = records[i][relation.primary_key];
          if(id && (!relation.polymorph || (relation.polymorph && records[i][relation.type_key] == Chain.definition.model_name))){
            
            if(condition[relation.foreign_key].indexOf(id) === -1){
              condition[relation.foreign_key].push(id);
            }
            record_map[id] = record_map[id] || [];
            record_map[id].push(records[i]);
          }
        }
        
        Chain.where(condition);
      }
      
    });
    
    
    
    
    this.afterInclude(function(result, records, include, cache, Model){
      
      //console.log('-----v-----');
      //console.log('Include:', include.name_tree, include.take);
      //console.log('Records:', records);
      //console.log('RESULT:', result);
      //console.log('-----!-----');
      
      var relation = include.relation;
      
      if(!result || result.length === 0) return 'STOP';
      if(!(result instanceof Array)) result = [result];
      
      if(!include.scope){
        //put sub_records into base models
        for(var i = 0; i < result.length; i++){
          if(relation.polymorph){
            //create a model, but only for polymoph relations.
            result[i] = Model.new(result[i]);
          }
        
          var records = cache.record_map[result[i][relation.foreign_key]];
          for(var r = 0; r < records.length; r++){
            
            if(include.take){
              console.log('TAKE', include.take, records, '<<', result);
              for(var as in include.take){
                
                //TODO: check relation type as well (see below..)
                records[r][as] = records[r][as] || [];
                var sr = result[i][include.take[as][0]];
                
                for(var t = 1; t < include.take[as].length; t++){
                  if(!sr) break;
                  if(sr instanceof Array) sr = sr[0];
                  sr = sr[include.take[as][t]];
                }
                if(sr){
                  console.log('>>', sr, 'on', records[r]);
                  records[r][as].push(sr);  
                }
                              
              }
              console.log('!!!!', records);
            }else{
            
              if(relation.type === 'has_many'){
                records[r][relation.name] = records[r][relation.name] || [];
                records[r][relation.name].push(result[i]);
              }else{
                records[r][relation.name] = records[r][relation.name] || result[i];
              }
              
            }
          }
        }
      }
      
    });
    
  }
};