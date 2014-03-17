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

    
    if(!name) self.handleException( new Error('no name given!'));
    if(!options.model) self.handleException( new Error('no model given!'));
    if(!options.type) self.handleException( new Error('no type given!'));
    
    
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

 
    if(options.through){
      Utils.getRelation(this, options.through, function(sub_relation){
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
        Utils.getModel(this.store, options.model, gotModel);
      }
    }
        
    return this;
  },
  
  
  /**
   * Adds a has many relation to the current Model
   *
   * @area Definition/Relations
   * @method hasMany
   * @param {string} name - The name of the relation
   * @param {object} options - Additional options for the relation
   * 
   * @options
   * @param {string} model - The related model Name
   * @param {string} primary_key - For SQL only
   * @param {string} foreign_key - For SQL only
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
      if(!this.relations[name]){
        if(!options.polymorph){
          this.relations[name] = options.model.chain();
        }else{
          this.relations[name] = this.model.chain({polymorph: true});
        }        
        this.emit('has_many_initialized', options, this.relations[name]);
      }
      
      this.relations[name].setInternal('relation_to', this);
      this.relations[name].setInternal('relation', options);
      
      if(!(records instanceof Array)) records = records ? [records] : [];
      
      for(var i=0; i < records.length; i++){
        if(records[i]){
          this.relations[name].add(records[i]);
        }        
      }
      
    };
    
    return this.relation(name, options);
  },
  
  
  /**
   * Adds a belongs to relation to the current Model
   *
   * @area Definition/Relations
   * @method belongsTo
   * @param {string} name - The name of the relation
   * @param {object} options - Additional options for the relation
   * 
   * @options
   * @param {string} model - The related model Name
   * @param {string} primary_key - For SQL only
   * @param {string} foreign_key - For SQL only
   * @param {string} polymorph - For SQL only
   *
   * @return {Definition}
   */  
  belongsTo: function(name, options){    
    options = options || {};    
    options.type = 'belongs_to'; 
    
    options.setter = function(record){
      var model = options.model;
      var added = false;

      if(record instanceof Array) record = record[0];
      
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
        this.emit('relation_record_added', options, this.relations[name]);
      }
    };
    
    return this.relation(name, options);
  },
  
  
  
  
  /**
   * Adds a has one relation to the current Model
   *
   * @area Definition/Relations
   * @method hasOne
   * @param {string} name - The name of the relation
   * @param {object} options - Additional options for the relation
   * 
   * @options
   * @param {string} model - The related model Name
   * @param {string} primary_key - For SQL only
   * @param {string} foreign_key - For SQL only
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
        if(record instanceof Array) record = record[0];
        
        if(record && typeof record == 'object'){
          this.relations[name] = options.model.new(record);
        }else{
          this.relations[name] = null;
        }          
      }
      if(this.relations[name]){
        this.emit('relation_record_added', options, this.relations[name]);
      }
    };
    
    return this.relation(name, options);
  }
};





/*
 * RECORD
 */
exports.record = {
  mixinCallback: function(config){
    config = config || {};
    this.relations = {};

    for(var name in this.definition.relations){
      if(this.definition.relations.hasOwnProperty(name)){
        var relation = this.definition.relations[name];
        if(config[name]) this[name] = config[name];
      }
    }    
  }
};