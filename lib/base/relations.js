var Util = require('../utils');
var Store = require('../store');

Store.addExceptionType(function RelationNotFoundError(Model, relation_name){
  Error.apply(this);
  this.message = "Can't find relation \"" + relation_name + "\" for " + Model.definition.model_name;
});


/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(config){
    this.relations = {};        
  },
  
  
  relation: function(name, options, callback){
    var self = this;
          
    options = options || {};           
    options.model = options.model || name;
    options.name = name;
    
    if(!name) self.handleException( new Error('no name given!'));
    if(!options.model) self.handleException( new Error('no model given!'));
    if(!options.type) self.handleException( new Error('no type given!'));
    
    Util.getModel(this.store, options.model, function(model){
      if(!model) self.handleException(new Store.RelationNotFoundError(self.model, name));
      options.model = model;
      
      self.relations[name] = options;
      
      self.getter(name, options.getter || function(){
        //this.relations is the relations object of the record!
        return this.relations[name];
      });
      
      self.setter(name, options.setter || function(record){        
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
      });
      
      
      if(self.model && self.model.building){
        self.once('finished', function(){
          self.emit('relation_added', options);
        })
      }else{
        self.emit('relation_added', options);
      }
            
    });
    
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
     
    options.setter = function(records){
      this.relations[name] = this.relations[name] || options.model.chain();
      this.relations[name].setInternal('collection_of', this);
      
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
   *
   * @return {Definition}
   */  
  belongsTo: function(name, options){    
    options = options || {};    
    options.type = 'belongs_to'; 
    
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
        this[name] = config[name] || null;
        if(config[name]){
          if(relation.type == 'has_many'){
            this[name].every.__exists = true;
          }else{
            this[name].__exists = true;
          }
        }   
        
      }
    }    
        
  }
};