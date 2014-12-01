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

      this.setInternal('includes_processes', true);
      
      return true;
    }, -10);
    
    
    
    
    
    this.afterFind(function(data, next){
      this.logger.trace('persistent/include', data);
      var self = this;
      var records = data.result;
      var includes = self.getInternal('includes') || [];
      var as_json = self.getInternal('as_json');
            
      var calls = [];

      for(var i = 0; i < includes.length; i++){
        var relation = includes[i].relation || {model: self.model}; //could be null if it's a scope call
        var Models = [];
        
        //we dont need to do anything if we dont have any records
        if(records.length === 0 && !includes[i].scope){
          continue;
        }
                
        
        //get all the models... only polymophic relations could have more than one model...
        if(relation.polymorph){
          for(var r = 0; r < records.length; r++){
            if(records[r][relation.type_key]){
              
              var raw_value = records[r][relation.type_key];
              if(this.model.definition.attributes[relation.type_key] && typeof this.model.definition.attributes[relation.type_key].type.cast.toModelName === 'function'){
                raw_value = this.model.definition.attributes[relation.type_key].type.cast.toModelName.call(this.model.definition, raw_value);
              }

              var Model = self.definition.store.Model(raw_value);
              if(Model && Models.indexOf(Model) == -1){
                Models.push(Model);
              }
            }else{
              self.logger.warn("Can't find attribute '" + relation.type_key + "' for model '" + self.model.definition.model_name + "'");
            }            
          }
        }else{
          Models.push(relation.model);
        }
        
        
        //loop over all models per include and create an async task for it...
        for(var m = 0; m < Models.length; m++){
          
          
          //the async task...
          (function(include, Model){
            calls.push(function(done){

              var Chain = Model.chain();
            
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
              
            
              var cache = {};
            
              self.callInterceptors('beforeInclude', [Chain, records, include, cache, Model, data], function(okay){
                if(okay){

                  Chain.exec(function(result){
                    self.callInterceptors('afterInclude', [result, records, include, cache, Model, data], function(){
                      done();
                    });
                    
                  }).catch(function(err){
                    done(err);
                  });
            
            
                }else{
                  done();
                }
              });
            
            
            });
          })(includes[i], Models[m]);
          
          
        }
                
      }
      
      
      if(calls.length === 0){
        return next();
      }
      
      async.parallel(calls, function(err){
        next(err);
      });
        
      
    }, 80);
    
    
    
    
    
    
    
    
    this.beforeInclude(function(Chain, records, include, cache){
            
      //add include conditions
      if(include.conditions){
        Chain.addInternal('conditions', include.conditions);
      }
      
      
      var relation = include.relation || {};      
      var record_map = cache.record_map = cache.record_map || {};
      
      //build conditions by primary and foreign_key
      if(relation.primary_key && relation.foreign_key){
        
        cache.key = relation.foreign_key;
        
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
      
      
      if(include.relation && include.relation.conditions && include.relation.conditions[include.relation.name]){
        Chain.where(include.relation.conditions[include.relation.name]);
      }
      
    }, 100);
    
    
    
    
    this.afterInclude(function(result, records, include, cache, Model){
      
      //TODO: make it configurable... merge with ldap includes
      var relation = include.relation;
      
      if(!result || result.length === 0) return 'STOP';
      if(!(result instanceof Array)) result = [result];
      
      if(!include.scope){        
        
        //put sub_records into base models
        for(var i = 0; i < result.length; i++){
          var key = result[i][cache.key];
          var records = [];
          
          if(key instanceof Array){
            for(var k = 0; k < key.length; k++){
              if(cache.record_map[key[k]]){
                records = records.concat(cache.record_map[key[k]]);
              }              
            }
          }else{
            records = cache.record_map[key];
          }
          
          
          if(relation.polymorph){
            //create a model, but only for polymoph relations.
            if(typeof result[i].set !== 'function'){
              result[i] = Model.new(result[i]);
            }
            
          }
                  
          if(!records) continue;
          for(var r = 0; r < records.length; r++){
            
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
            
            
            
            if(relation.type === 'has_many'){
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