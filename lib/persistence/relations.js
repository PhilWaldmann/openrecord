var inflection = require('inflection');


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
      
    this.on('relation_added', function(options){

      var primary_key = this.primary_keys[0]; //should we throw an error here if there is no primary key?
      options.conditions = options.conditions || {};
      
      if(options.as){
        options.foreign_key = options.foreign_key || options.as + '_' + primary_key;
        options.conditions[options.name] = options.conditions[options.name] || {};
        options.conditions[options.name][options.polymorphic_type || options.as + '_type'] = self.model_name;
      }
      
      if(options.polymorph){
        options.primary_key = options.name + '_' + primary_key;
        options.foreign_key = primary_key;
        options.type_key = options.type_key || options.name + '_type';
      }
            
      if(options.type == 'has_many' || options.type == 'has_one'){
        options.foreign_key = options.foreign_key || inflection.singularize(self.getName()) + '_' + primary_key;
        options.primary_key = options.primary_key || primary_key;
      }
      
      if(options.type == 'belongs_to'){
        options.primary_key = options.primary_key || inflection.singularize(options.model.definition.getName()) + '_' + primary_key;
        options.foreign_key = options.foreign_key || primary_key;
        
        if(!self.attributes[options.primary_key]){ //if there is no primary_key field available, try relation_name + _id
          options.primary_key = inflection.singularize(options.name) + '_' + primary_key;
        }
      }
            
    });
    
    
    
    this.on('relation_record_added', function(parent, options, record){
      if(options.through){
        var through_rel = parent.model.definition.relations[options.through];
        var target_rel = through_rel.model.definition.relations[options.relation];
        
        var tmp = {};
        tmp[through_rel.foreign_key] = parent[through_rel.primary_key];
        tmp[target_rel.primary_key] = record[target_rel.foreign_key];
        tmp[options.relation] = record;
                
        if(through_rel.type == 'has_many'){
          parent[options.through].add(tmp);
        }else{
          parent[options.through] = tmp;
        }
      }else{
        if(options.type == 'has_many' || options.type == 'has_one'){
          record[options.foreign_key] = parent[options.primary_key];
        }
      }      
    });
    
    this.on('relation_initialized', function(record, options, collection){      
      if(options.type == 'has_many' && !options.polymorph){
        var conditions = {};
        conditions[options.foreign_key] = record[options.primary_key];
        collection.where(conditions);
      }
    });
    
  }
};