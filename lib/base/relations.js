var util = require('util');
var Utils = require('../utils');
var Store = require('../store');

Store.addExceptionType(function RelationNotFoundError(Model, relation_name){
  Error.apply(this);
  this.message = "Can't find relation \"" + relation_name + "\" for " + Model.definition.model_name;
});

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.relations = {};
  },


  relation: function(name, options){
    var self = this;

    options = options || {};
    options.model = options.model || name;
    options.name = name;

    if(!name) throw new Error('no name given!');
    if(!options.model) throw new Error('no model given!');
    if(!options.type) throw new Error('no type given!');


    var gotModel = function(model){
      options.model = model;

      self.relations[name] = options;

      self.getter(name, options.getter || function(){
        //this.relations is the relations object of the record!
        return this.relations[name];
      });

      self.setter(name, options.setter);

      if(self.model && self.model.finished){
        self.emit('relation_added', options);
        self.emit(name + '_added', options);
      }else{
        self.once('finished', function(){
          self.emit('relation_added', options);
          self.emit(name + '_added', options);
        });
      }
    };



    Utils.getStore(Store, options.store, self.store, function(store){
      if(options.through){
        Utils.getRelation(self, options.through, function(sub_relation){
          options.relation = options.relation || options.name;
          Utils.getRelation(sub_relation.model.definition, options.relation, function(relation){
            options.polymorph = relation.polymorph === true;
            gotModel(relation.model);
          });
        });
      }else{
        if(options.polymorph){
          gotModel(null);
        }else{
          Utils.getModel(store, options.model, gotModel);
        }
      }
    });



    return this;
  },


  /**
   * Adds a has many relation to the current Model
   *
   * @class Definition
   * @method hasMany
   * @param {string} name - The name of the relation
   * @param {object} options - Additional options for the relation
   *
   * @options
   * @param {string} model - The related model Name
   * @param {string} store - Optional store name for cross-store relations
   * @param {string} through - The through relation name
   * @param {string} relation - The target relation name (in conjunction with through)
   *
   * @return {Definition}
   */
  hasMany: function(name, options){
    options = options || {};
    options.type = 'has_many';

    options.getter = function(){
      if(!this.relations[name]){
        this[name] = null; //creates a new chained model...
      }

      return this.relations[name];
    };

    options.setter = function(records){
      if(records === this.relations[name]){
        return;
      }

      if(!this.relations[name]){
        if(!options.polymorph){
          this.relations[name] = options.model.chain();
        }else{
          this.relations[name] = this.model.chain({polymorph: true});
        }

        this.model.definition.emit('relation_initialized',this, options, this.relations[name]);
      }

      this.relations[name].setInternal('relation_to', this);
      this.relations[name].setInternal('relation', options);

      if(!util.isArray(records)) records = records ? [records] : [];

      for(var i=0; i < records.length; i++){
        if(records[i]){
          //add() calls emit('relation_record_added')
          this.relations[name].add(records[i]);
        }
      }

    };

    return this.relation(name, options);
  },


  /**
   * Adds a belongs to relation to the current Model
   *
   * @class Definition
   * @method belongsTo
   * @param {string} name - The name of the relation
   * @param {object} options - Additional options for the relation
   *
   * @options
   * @param {string} model - The related model Name
   * @param {string} store - Optional store name for cross-store relations
   * @param {string} through - The through relation name
   * @param {string} relation - The target relation name (in conjunction with through)
   * @param {boolean} polymorph - true to define this relation as polymorph.
   *
   * @return {Definition}
   */
  belongsTo: function(name, options){
    options = options || {};
    options.type = 'belongs_to';

    options.setter = function(record){
      var model = options.model;
      var added = false;

      if(util.isArray(record)) record = record[0];

      if(options.polymorph && record){
        model = record.model;
      }

      if(model && record instanceof model){
        this.relations[name] = record;
        added = true;
      }else{
        if(model && record && typeof record == 'object'){
          this.relations[name] = model.new(record);
          added = true;
        }else{
          this.relations[name] = null;
        }
      }
      if(this.relations[name] && added){
        this.model.definition.emit('relation_record_added', this, options, this.relations[name]);
      }
    };

    return this.relation(name, options);
  },




 /**
  * Adds a belongs to many relation to the current Model
  *
  * @class Definition
  * @method belongsToMany
  * @param {string} name - The name of the relation
  * @param {object} options - Additional options for the relation
  *
  * @options
  * @param {string} model - The related model Name
  * @param {string} store - Optional store name for cross-store relations
  * @param {string} through - The through relation name
  * @param {string} relation - The target relation name (in conjunction with through)
  *
  * @return {Definition}
  */
 belongsToMany: function(name, options){
   options = options || {};
   options.type = 'belongs_to_many';

   options.getter = function(){
     if(!this.relations[name]){
       this[name] = null; //creates a new chained model...
     }

     return this.relations[name];
   };

   options.setter = function(records){
     if(records === this.relations[name]){
       return;
     }

     if(!this.relations[name]){
       if(!options.polymorph){
         this.relations[name] = options.model.chain();
       }else{
         this.relations[name] = this.model.chain({polymorph: true});
       }
       this.model.definition.emit('relation_initialized',this, options, this.relations[name]);
     }

     this.relations[name].setInternal('relation_to', this);
     this.relations[name].setInternal('relation', options);

     if(!util.isArray(records)) records = records ? [records] : [];

     for(var i=0; i < records.length; i++){
       if(records[i]){
         //add() calls emit('relation_record_added')
         this.relations[name].add(records[i]);
       }
     }

   };

   return this.relation(name, options);
 },




  /**
   * Adds a has one relation to the current Model
   *
   * @class Definition
   * @method hasOne
   * @param {string} name - The name of the relation
   * @param {object} options - Additional options for the relation
   *
   * @options
   * @param {string} model - The related model Name
   * @param {string} store - Optional store name for cross-store relations
   * @param {string} through - The through relation name
   * @param {string} relation - The target relation name (in conjunction with through)
   *
   * @return {Definition}
   */
  hasOne: function(name, options){
    options = options || {};
    options.type = 'has_one';

    options.setter = function(record){
      if(record instanceof options.model){
        this.relations[name] = record;
      }else{
        if(util.isArray(record)) record = record[0];

        if(record && typeof record == 'object'){
          this.relations[name] = options.model.new(record);
        }else{
          this.relations[name] = null;
        }
      }
      if(this.relations[name]){
        this.model.definition.emit('relation_record_added', this, options, this.relations[name]);
      }
    };

    return this.relation(name, options);
  }
};





/*
 * RECORD
 */
exports.record = {

  set: function(field, value){

    var tmp = this.callParent(field, value);

    if(typeof field === 'object'){
      this.relations = this.relations || {};

      for(var name in this.definition.relations){
        if(this.definition.relations.hasOwnProperty(name)){
          var relation = this.definition.relations[name];
          if(field[name]) this[name] = field[name];
        }
      }
    }

    return tmp;

  }

};
