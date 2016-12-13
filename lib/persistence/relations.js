var util = require('util');
var inflection = require('inflection');
var Utils = require('../utils');


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;

    /**
     * Adds a has many relation to the current Model
     *
     * @class Definition
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
     * Adds a belongs to relation to the current Model
     *
     * @class Definition
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
     * Adds a has one relation to the current Model
     *
     * @class Definition
     * @method hasOne
     *
     * @options
     * @param {string} primary_key - SQL only
     * @param {string} foreign_key - SQL only
     * @param {object} conditions - Extra conditions for the relation
     * @param {string} dependent - `destroy`, `delete` or null. Default to null - SQL only
     *
     */

    this.on('relation_added', function(options){

      var primary_key = this.primary_keys[0] || 'id'; //TODO: support multiple primary keys...
      options.conditions = options.conditions || {};


      if(options.as){
        options.foreign_key = options.foreign_key || options.as + '_' + primary_key;
        options.conditions[options.polymorphic_type || options.as + '_type'] = self.model_name;
      }

      if(options.polymorph){
        options.type_key = options.type_key || options.name + '_type';

        if(!options.primary_key && primary_key){
          options.primary_key = options.name + '_' + primary_key;
        }

        options.foreign_key = options.foreign_key || primary_key;
      }

      if(options.type == 'has_many' || options.type == 'has_one'){
        options.primary_key = options.primary_key || primary_key;

        if(!options.foreign_key && primary_key){
          options.foreign_key = options.foreign_key || inflection.singularize(self.getName()) + '_' + primary_key;
        }
      }

      if(options.type == 'belongs_to'){
        if(!options.primary_key && primary_key){
          options.primary_key = inflection.singularize(options.model.definition.getName()) + '_' + primary_key;
        }

        options.foreign_key = options.foreign_key || primary_key;

        if(!self.attributes[options.primary_key]){ //if there is no primary_key field available, try relation_name + _id
          options.primary_key = inflection.singularize(options.name) + '_' + primary_key;
        }
      }

      if(options.type == 'belongs_to_many'){
        if(!options.primary_key && primary_key){
          options.primary_key = inflection.singularize(options.model.definition.getName()) + '_' + primary_key + 's';
        }

        options.foreign_key = options.foreign_key || primary_key;

        if(!self.attributes[options.primary_key]){ //if there is no primary_key field available, try relation_name + _ids
          options.primary_key = inflection.singularize(options.name) + '_' + primary_key + 's';
        }
      }


      //check if the primary_key field exists - delete if not!
      if(!self.attributes[options.primary_key]){
        options.primary_key = undefined;
      }

      if(options.primary_key && !options.through){
        options.conditions = options.conditions || {};
        options.conditions[options.foreign_key] = {attribute: options.primary_key, model: self.model};
      }

      //TODO: primary_key and foreign_key are here for backwards compatibility... remove them with version 2.0!


      //create magic attribute <relation_name>_ids = [1, 2, 3]
      if(options.type == 'has_many' && options.primary_key){

        var attr_name = inflection.singularize(options.name) + '_' + inflection.pluralize(options.primary_key);

        self.attribute(attr_name, Array, {
          hidden: true,
          setter: function(value){
            this[options.name].add(value);
            this.set(attr_name, value);
          }
        });

      }


    });



    this.on('relation_record_added', function(parent, options, record){

      //if records with an id/primary key are added, mark the record as existing => a save will trigger an update!
      var primary_keys = self.primary_keys;
      var existing_keys = 0;

      for(var i = 0; i < primary_keys.length; i++){
        if(record[primary_keys[i]]){
          existing_keys++;
        }
      }

      if(existing_keys === primary_keys.length && existing_keys > 0){
        record.__exists = true;
      }


      if(options.through){
        var through_rel = parent.model.definition.relations[options.through];
        var target_rel = through_rel.model.definition.relations[options.relation];

        var tmp = {};
        tmp[through_rel.foreign_key] = parent[through_rel.primary_key];
        tmp[target_rel.primary_key] = record[target_rel.foreign_key];
        tmp[options.relation] = record;

        if(through_rel.type == 'has_many' || through_rel.type == 'belongs_to_many'){
          parent[options.through].add(tmp);
        }else{
          parent[options.through] = tmp;
        }
      }else{

        var attrs = Utils.clone(options.conditions);

        for(var base in attrs){
          if(attrs[base] && attrs[base].attribute){
            if(options.type == 'has_many' || options.type == 'has_one'){
              if(parent[attrs[base].attribute]){
                attrs[base] = parent[attrs[base].attribute];
              }else{
                delete attrs[base];
              }
            }else{
              if(options.type == 'belongs_to_many'){
                if(record[base]){
                  attrs[attrs[base].attribute] = attrs[attrs[base].attribute] || [];
                  attrs[attrs[base].attribute].push(record[base]);
                }
              }else{
                if(record[base]){
                  attrs[attrs[base].attribute] = record[base];
                }
              }

              delete attrs[base];
            }
          }
        }

        if(options.type == 'has_many' || options.type == 'has_one'){
          record.set(attrs);
        }else{
          parent.set(attrs);
        }

      }
    });



    this.on('relation_initialized', function(record, options, collection){
      if(options.type == 'has_many' && !options.polymorph){
        var attrs = Utils.clone(options.conditions) || {};

        for(var base in attrs){
          if(attrs[base] && attrs[base].attribute){
            if(record[attrs[base].attribute]){
              attrs[base] = record[attrs[base].attribute];
            }else{
              delete attrs[base];
            }
          }
        }

        collection.where(attrs);
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
      var cast_type = value;

      this.relations = this.relations || {};

      for(var name in this.definition.relations){
        if(this.definition.relations.hasOwnProperty(name)){
          var data = field[name];
          if(data){
            var relation = this.definition.relations[name];
            if(!relation.model) continue;
            var primary_keys = relation.model.definition.primary_keys;

            if(!util.isArray(data)) data = [data];

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
                records[0].set(data[o], cast_type);
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
