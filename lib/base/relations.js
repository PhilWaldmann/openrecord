var Util = require('../utils');

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
    
    if(!name) throw new Error('no name given!');
    if(!options.model) throw new Error('no model given!');
    if(!options.type) throw new Error('no type given!');
    
    Util.getModel(this.store, options.model, function(model){
      if(!model) throw new Error('Can not find a model for relation', name);
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
          this.relations[name] = new options.model(record);
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
  
  
  
  hasMany: function(name, options){          
    options = options || {};
    options.type = 'has_many';   
     
    options.setter = function(records){
      this.relations[name] = this.relations[name] || options.model.chain();
      this.relations[name].setInternal('collection_of', this);
      
      if(!(records instanceof Array)) records = [records];
      
      for(var i=0; i < records.length; i++){
        if(records[i]){
          this.relations[name].add(records[i]);
        }        
      }
      
    };
    
    return this.relation(name, options);
  },
  
  
  
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
      this[name] = config[name] || null;
    }    
        
  }
};