var async = require('async');

var Utils = require('../../utils');

/*
 * MODEL
 */
exports.model = {
  /**
   * Include relations into the result
   * @area Model/Find
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
    var relations = Utils.args(arguments); 
    
    var parseIncludes = function(relations, parent, name_tree){
      for(var i = 0; i < relations.length; i++){
        if(typeof relations[i] == 'string'){
          var relation = parent.definition.relations[relations[i]];
          if(relation){
            self.addInternal('includes', {
              relation:relation, 
              parent:parent, 
              name_tree: name_tree.concat(relation.name)
            }); 
          }else{
            self.handleException(new Store.RelationNotFoundError(parent, relations[i]));
          }
        }else{
          if(relations[i] instanceof Array){
            
            parseIncludes(relations[i], parent, name_tree);
            
          }else{

            for(var name in relations[i]){
              var relation = parent.definition.relations[name];
              if(relation){
                self.addInternal('includes', {
                  relation:relation, 
                  parent:parent,
                  name_tree: name_tree.concat(relation.name)
                }); 
                parseIncludes([relations[i][name]], relation.model, name_tree.concat(relation.name));
              }else{
                self.handleException(new Store.RelationNotFoundError(parent, name));
              }
            }
            
          }
        }          
      }
    };
        
    parseIncludes(relations, self, []);
    
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
        var table_name = relation.model.definition.table_name;
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
      var records = data.result;
      var includes = this.getInternal('includes') || [];
      
      if(records.length == 0){
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
          var record_map = {};
          var condition = {};
          condition[relation.foreign_key] = [];
        
          //build conditions
          for(var r in records){
            var id = records[r][relation.primary_key];
            if(id){
              if(condition[relation.foreign_key].indexOf(id) === -1){
                condition[relation.foreign_key].push(id);
              }
              record_map[id] = record_map[id] || [];
              record_map[id].push(records[r]);
            }
          }
          
          if(!base[name]){
            base[name] = {
              includes:[],
              conditions: condition,
              custom_conditions: includes[i].conditions,
              records: record_map,
              model: relation.model,
              relation: relation
            };
          }
        }else{
          var inc = toNestedIncludes(includes[i].name_tree.slice(0).splice(1));
          
          if(base[name]){
            base[name].includes.push(inc);
          }else{
            
            var record_map = {};
            var condition = {};
            condition[relation.foreign_key] = [];
        
            //build conditions
            for(var r in records){
              var id = records[r][name][relation.primary_key];
              if(id){
                if(condition[relation.foreign_key].indexOf(id) === -1){
                  condition[relation.foreign_key].push(id);
                }
                record_map[id] = record_map[id] || [];
                record_map[id].push(records[r][name]);
              }
            }
            
            base[name] = {
              includes:[],
              conditions: condition,
              custom_conditions: includes[i].conditions,
              records: record_map,
              model: relation.model,
              relation: relation
            };
          }            
        }
      }
      
      
      
      //create async.parallel() calls array with "subselects"
      var calls = [];
      for(var i in base){
        (function(base){
          
          var relation = base.relation;
          
          calls.push(function(next){
            //"subselect"
            var Chain;
            
            Chain = base.model.include(base.includes).where(base.conditions)
            
            for(var c = 0; c < base.custom_conditions.length; c++){
              Chain.addInternal('conditions', base.custom_conditions[c]);
            }
            
            Chain.exec(function(sub_records){
              //put sub_records into base models
              for(var i = 0; i < sub_records.length; i++){
                var records = base.records[sub_records[i][relation.foreign_key]];
                for(var r in records){
                  records[r][relation.name] = records[r][relation.name] || [];
                  records[r][relation.name].push(sub_records[i]);
                }
              }
              next(null);
            });
          });
          
        })(base[i]);
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