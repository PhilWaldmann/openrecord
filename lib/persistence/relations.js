var inflection = require('inflection');


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;
    
    /**
     *
     * @section Definition/Relations
     * @method hasMany
     * 
     * @options
     * @param {string} primary_key - SQL only
     * @param {string} foreign_key - SQL only
     * @param {string} as - the name of a polymophic relation - SQL only
     * @param {object} conditions - Extra conditions for the relation - SQL only
     * @param {string} dependent - `destroy`, `delete`, `nullify` or null. Default to null - SQL only
     *
     */
    
    
    /**
     *
     * @section Definition/Relations
     * @method belongsTo
     *
     * @options
     * @param {string} primary_key - SQL only
     * @param {string} foreign_key - SQL only
     * @param {string} type_key - the name of the polymorphic relation. You need to have a <name>_type and <name>_<primary_key> attribute on your model. Default is the relation name - SQL only
     * @param {object} conditions - Extra conditions for the relation - SQL only
     * @param {string} dependent - `destroy`, `delete` or null. Default to null - SQL only
     *
     */  
    
    
    /**
     *
     * @section Definition/Relations
     * @method hasOne
     *
     * @options
     * @param {string} primary_key - SQL only
     * @param {string} foreign_key - SQL only
     * @param {object} conditions - Extra conditions for the relation - SQL only
     * @param {string} dependent - `destroy`, `delete` or null. Default to null - SQL only
     *
     */
    
    this.on('relation_added', function(options){

      var primary_key = this.primary_keys[0]; //should we throw an error here if there is no primary key?
      options.conditions = options.conditions || {};
      
      if(options.as){
        options.foreign_key = options.foreign_key || options.as + '_' + primary_key;
        options.conditions[options.name] = options.conditions[options.name] || {};
        options.conditions[options.name][options.polymorphic_type || options.as + '_type'] = self.model_name;
      }
      
      if(options.polymorph){
        options.type_key = options.type_key || options.name + '_type';
        options.primary_key = options.type_key + '_' + primary_key;
        options.foreign_key = primary_key;
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
          if(parent[options.primary_key]){
            record[options.foreign_key] = parent[options.primary_key];
          }          
        }else{
          if(record[options.foreign_key]){
            parent[options.primary_key] = record[options.foreign_key];
          }          
        }
      }
      
      
      //if records with an id/primary key are added, mark the record as existing => a save will trigger an update!
      var primary_keys = self.primary_keys;
      var exists = true;
      
      for(var i = 0; i < primary_keys.length; i++){
        if(!record[primary_keys[i]]){
          exists = false;
        }
      }
      
      if(exists){
        record.__exists = true;
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


/*
 * RECORD
 */
exports.record = {
  
  
  //check if the given record have the primary key set => update instead of create!
  set: function(field, value){
    
    if(typeof field === 'object'){
      this.relations = this.relations || {};
      
      for(var name in this.definition.relations){
        if(this.definition.relations.hasOwnProperty(name)){
          var data = field[name];
          if(data){
            var relation = this.definition.relations[name];
            if(!relation.model) continue;
            var primary_keys = relation.model.definition.primary_keys;
            
            if(!(data instanceof Array)) data = [data];
            
            for(var o = 0; o < data.length; o++){
              if(typeof data[o] !== 'object') continue;
              
              var records = this.relations[name] || []; //search the record with the primary key - if available
              for(var i = 0; i < primary_keys.length; i++){
                var key = primary_keys[i];
                var tmp = [];
                if(data[o][key]){
                  for(var x = 0; x < records.length; x++){
                    if(records[x][key] == data[o][key]){
                      tmp.push(records[x]);
                    }
                  }
                  records = tmp;
                }
              }
            
              if(records.length > 0){
                records[0].set(data[o]);
                delete field[name];
              }
            }
          }
        }
      }
    }
    
    return this.callParent(field, value);
  }
  
};