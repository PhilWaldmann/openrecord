var util = require('util');
var inflection = require('inflection');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;

    this.afterFind(function(data){
      self.logger.trace('persistent/collection', data);
      var as_json = this.getInternal('as_json');
      var as_raw = this.getInternal('as_raw');
      var records = data.result;

      if(!records) return true;

      if(as_json !== true){

        // CREATE RECORDs WITH DATA
        for(var i = 0; i < records.length; i++){
          records[i] = this.new(records[i], 'read');
          records[i]._exists();
        }

        data.result = this;
      }else{
        //RETURN RAW JSON
        if(!as_raw){
          var allowed_attributes = this.getInternal('allowed_attributes');
          var dummy_record = this.new();

          for(var i = 0; i < records.length; i++){
            dummy_record.relations = {};
            dummy_record.attributes = {};
            dummy_record.set(records[i], 'read');
            records[i] = dummy_record.toJson(allowed_attributes);
          }
        }
      }

      return true;
    }, 55);

  }
};


/*
 * MODEL
 */
exports.model = {
  /**
   * Creates a new record and saves it
   * @class Model
   * @method create
   * @param {object} data - The data of the new record
   * @param {function} resolve - The resolve callback
   * @param {function} reject - The reject callback
   *
   * @callback
   * @param {boolean} result - true if the create was successful
   * @this Record
   *
   * @return {Model}
   * @see Model.save()
   */
  create: function(data, resolve, reject){
    if(util.isArray(data)){
      return this.chain().add(data);
    }
    return this.new(data).save(resolve, reject);
  },


  /**
   * `exec()` will return raw JSON instead of records
   * @class Model
   * @method asJson
   * @param {array} allowed_attributes - Optional: Only export the given attributes and/or relations
   *
   * @return {Model}
   * @see Model.exec()
   */
  asJson: function(allowed_attributes){
    var self = this.chain();

    self.setInternal('as_json', true);

    if(util.isArray(allowed_attributes)) self.setInternal('allowed_attributes', allowed_attributes);

    return self;
  },


  /**
   * `exec()` will return the raw store output
   * Be aware, that no `afterFind` hook will be fired if you use `asRaw()`.
   *
   * @class Model
   * @method asRaw
   *
   * @return {Model}
   * @see Model.exec()
   */
  asRaw: function(){
    var self = this.asJson();

    self.setInternal('as_raw', true);

    return self;
  }
};



/*
 * CHAIN
 */
exports.chain = {

  add: function(records){

    var self = this.callParent(records);

    var relation = self.getInternal('relation');
    var parent_record = self.getInternal('relation_to');

    if(!util.isArray(records)) records = [records];

    for(var i = 0; i < records.length; i++){
      var record = records[i];
      if(typeof record !== 'object'){
        if(!relation || !relation.through || !parent_record) continue;

        var through_rel = parent_record.model.definition.relations[relation.through];
        var target_rel = through_rel.model.definition.relations[relation.relation];

        var tmp = {};

        for(var base in through_rel.conditions){
          if(through_rel.conditions[base] && through_rel.conditions[base].attribute){
            tmp[base] = parent_record[through_rel.conditions[base].attribute];
          }else{
            tmp[base] = through_rel.conditions[base];
          }
        }

        for(var base in target_rel.conditions){
          if(target_rel.conditions[base] && target_rel.conditions[base].attribute){
            tmp[target_rel.conditions[base].attribute] = record;
          }
        }

        if(through_rel.type == 'has_many' || through_rel.type == 'belongs_to_many'){
          parent_record[relation.through].add(tmp);
        }else{
          parent_record[relation.through] = tmp;
        }

      }
    }

    return self;
  },

  _exists: function(){
    for(var i = 0; i < this.length; i++){
      this[i]._exists();
    }
  }
};



/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config){
    var chained_model = config ? config.__chained_model : null;

    if(this.model.chained){
      chained_model = this;
    }

    Object.defineProperty(this, '__chained_model', {enumerable: false, writable: true, value: chained_model});
    Object.defineProperty(this, '__exists', {enumerable: false, writable: true, value: false});

  },

  _exists: function(){
    this.__exists = true;
    this.changes = {}; //Hard-Reset all changes

    for(var name in this.definition.relations){
      if(this.definition.relations.hasOwnProperty(name)){
        var relation = this.definition.relations[name];
        if(this.relations && this.relations[name]){
          this.relations[name]._exists();
        }
      }
    }
  }
};
