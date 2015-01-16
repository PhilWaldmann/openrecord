var async = require('async');

var Utils = require('../utils');

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
    var relations = Utils.sanitizeRelations(self, Utils.args(arguments));
    
    
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
              i--;
              continue;
            }
          
            processed_relations.push(relation.name);
          
            //add all conditions which relate to the included relation
            for(var c = 0; c < conditions.length; c++){
              if(conditions[c] && conditions[c].name_tree.indexOf(relation.name) != -1){
                var cond = Utils.clone(conditions[c]);
                cond.name_tree.shift()
                tmp.push(cond);
                delete conditions[c];
              }
            }
                
            includes[i].conditions = tmp;
            
            //convert the flatt includes list into a tree like structure
            //TODO: we get the whole thing as a tree like structure... so why are we doing this here?
            var pos = includes[i].name_tree.length - 1;
            var parent_name;
            var parent;
        
            include_tree[includes[i].name_tree.join('.')] = includes[i];
        
            do{
              parent_name = includes[i].name_tree.slice(0, pos).join('.');
              parent = include_tree[parent_name];
              pos--;
            }while(!parent && pos > 0);
                
            if(parent){
                
              parent.child_includes = parent.child_includes || [];
              parent.child_includes.push(includes[i]);
              
              if(includes[i].as){
                var base_parent = include_tree[includes[i].name_tree[0]];
                var as = includes[i].as[0];
                var take = includes[i].name_tree.slice(1);

                if(includes[i].as.length > 1){
                  //freaky stuff... calucalte the new "as" name (last element)...
                  as = includes[i].as[includes[i].as.length - 1];
                  //... caluclate the path to that element...
                  take = includes[i].name_tree.slice(includes[i].as.length);
                  //... and get that include object for it
                  base_parent = include_tree[includes[i].name_tree.slice(0, includes[i].as.length).join('.')];
                }
                
                if(base_parent){
                  base_parent.take = base_parent.take || {};
                  base_parent.take[as] = take;
                }
              }
              
              includes[i].name_tree = includes[i].name_tree.slice(-1);
              
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
      
      return true;
    }, -10);
    
    
    
    
    
    this.afterFind(function(data, next){
      this.logger.trace('persistent/include', data);
      var self = this;
      var records = data.result;
      var includes = self.getInternal('includes') || [];
      var as_json = self.getInternal('as_json');
            
      if(!records) return next();
            
      var calls = [];

      for(var i = 0; i < includes.length; i++){
        
        //we dont need to do anything if we dont have any records - except it's a scope
        if(records.length === 0 && !includes[i].scope){ //TODO: scopes on the base should be done in parallel to the initial find ... this is a little bit tricky, because is currently no way to call a function after everything (base query + scope) is ready...
          continue;
        }
        
        (function(include){
          
          calls.push(function(relation_done){
            
            var cache = {};
            var Chains = []
          
            self.callInterceptors('beforeInclude', [Chains, records, include, cache, data], function(okay){
              if(okay){
                
                var chain_calls = [];
                
                for(var c = 0; c < Chains.length; c++){
                  (function(Chain){
                    chain_calls.push(function(include_done){
                      
                      //add child includes
                      if(include.child_includes){
                        Chain.addInternal('includes', include.child_includes);
                      }
                          
                      //add polymorph/through includes
                      if(include.sub_includes){
                        Chain.include(include.sub_includes);
                      }
              
                      if(as_json){
                        Chain.asJson();
                      }
                      
                      self.callInterceptors('onInclude', [Chain, records, include, cache, data], function(okay){
                        if(okay){
                          Chain.exec(function(result){
                            self.callInterceptors('afterInclude', [Chain.definition.model, result, records, include, cache, data], function(){
                              include_done();
                            });
                          }).catch(function(err){
                            include_done(err);
                          });
                        }else{
                          include_done();
                        }                        
                      });
                      
                      
                    });
                  })(Chains[c]);
                }
                
                
                if(chain_calls.length === 0){
                  return next();
                }
      
                async.parallel(chain_calls, function(err){
                  return relation_done(err);
                });
                
              }else{
                relation_done();
              }
            });
          });
          
        })(includes[i]);
        
      }
      
      
      if(calls.length === 0){
        return next();
      }
      
      async.parallel(calls, function(err){
        next(err);
      });
      
    }, 80);
    
    
    
    
    
    
    
    
    this.beforeInclude(function(Chains, records, include, cache){
            
      if(Chains.length > 0) return; //another interceptor has already done something
      if(!include.relation || include.scope) return; //scopes do not have any relations - filter them out.
      
      
      var relation = include.relation;
        
      if(relation.polymorph && relation.type_key){
        var models = [];
        
        for(var r = 0; r < records.length; r++){
          var model_name = records[r][relation.type_key];
          
          if(typeof relation.type_key === 'function'){
            model_name = relation.type_key(records[r]);
          }
                    
          if(model_name && models.indexOf(model_name) === -1){
            models.push(model_name);
            
            var Model = this.definition.store.Model(model_name);
            if(Model){
              Chains.push( Model.chain() );
            }
            
          }           
        }
      }else{
        Chains.push( relation.model.chain() );
      }
      
    }, 100);
    
    
    
    
    this.onInclude(function(Chain, records, include, cache){
            
      if(!include.relation || include.scope) return; //scopes do not have any relations - filter them out.
      
      var relation = include.relation;
      var name_tree = include.name_tree;
      var conditions = relation.conditions;
      var condition = {};
      
      
      //add include conditions
      if(include.conditions){
        Chain.addInternal('conditions', include.conditions);
      }
      
      //loop over base conditions and replace attribute=attribute conditions with attribute = [ids,...]
      for(var base in conditions){
        if(conditions.hasOwnProperty(base) && conditions[base] && conditions[base].attribute){

          condition[base] = [];
                    
          for(var i = 0; i < records.length; i++){
            
            if(relation.polymorph){
              var model_name = records[i][relation.type_key];
          
              if(typeof relation.type_key === 'function'){
                model_name = relation.type_key(records[i]);
              }
              if(model_name !== Chain.definition.model_name) continue;
            }
            
            var id = records[i][conditions[base].attribute];
            if(!(id instanceof Array)) id = [id];
              
            for(var x = 0; x < id.length; x++){
              if(id[x] && condition[base].indexOf(id[x]) === -1){
                condition[base].push(id[x]);              
              }
            }
          }
        }else{
          condition[base] = conditions[base];
        }
      }
      
      Chain.where(condition); 
    });
    
    
    
    
    
    
    this.afterInclude(function(Model, result, records, include, cache){
      
      if(!include.relation) return; //scopes do not have any relations - filter them out.

      if(!result || result.length === 0) return 'STOP';
      if(!(result instanceof Array)) result = [result];
      
      var relation = include.relation;
      var conditions = relation.conditions;
      
      if(Object.keys(conditions).length === 0) return;
      
      //add result into records - based in the conditions - a kind of offline join
      for(var i = 0; i < result.length; i++){        
        
        for(var r = 0; r < records.length; r++){
          var matches = 0;
          var rules = 0;
          
          //check all conditions for a match!
          for(var base in conditions){
            if(conditions.hasOwnProperty(base) && conditions[base] && conditions[base].attribute){
              var key1 = records[r][conditions[base].attribute];
              var key2 = result[i][base];
              
              if(key1 instanceof Array && key2 instanceof Array){
                if(relation.contains === true){ //relation option: contains: true => check if there is at least on matching value, default => check strict equality
                  if(key1.filter(function(k){return key2.indexOf(k) !== -1;}).length > 0){ //intersect
                    matches++;
                  }
                }else{
                  if(key1.sort().toString() == key2.sort().toString()){ //strict equal
                    matches++;
                  }
                }
              }else{
                if(key1 instanceof Array){
                  if(key1.indexOf(key2) !== -1){ //key1 contains key2
                    matches++;
                  }
                }else{
                  if(key2 instanceof Array){
                    if(key2.indexOf(key1) !== -1){ //key2 contains key1
                      matches++;
                    }
                  }else{
                    if(key1 == key2){ //key1 equal key2
                      matches++;
                    }
                  }
                }
              }
              
              rules++;     
            }
          }
          
          if(relation.polymorph){
            var model_name = records[r][relation.type_key];
        
            if(typeof relation.type_key === 'function'){
              model_name = relation.type_key(records[r]);
            }

            if(model_name === Model.definition.model_name) matches++;
            rules++;
          }
          
          
          if(matches === rules){
            
            if(relation.polymorph){
              //create a model, but only for polymoph relations.
              if(typeof result[i].set !== 'function'){
                result[i] = Model.new(result[i], 'read');
              }            
            }   
            
            if(include.take){
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
                  records[r][as].push(sr);  
                }                        
              }
            }
            
            if(relation.type === 'has_many' || relation.type === 'belongs_to_many'){
              records[r][relation.name] = records[r][relation.name] || [];
              records[r][relation.name].push(result[i]);
            }else{
              records[r][relation.name] = records[r][relation.name] || result[i];
            }
          }
        }
      }
    }, 100);
    
  }
};