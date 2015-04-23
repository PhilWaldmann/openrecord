var util = require('util');


exports.migration = {
  nestedSet: function(){
    this.integer('lft');
    this.integer('rgt');
    this.integer('depth');
    this.integer('parent_id', {default:0});
  }
};


exports.definition = {
  
  nestedSet: function(){
    
    var self = this;
    
    this.attribute('leaf', Boolean, {
      writable: false,
      default: true
    });
    
    this.hasMany('children', {model: this.getName(), foreign_key: 'parent_id'});
    this.belongsTo('parent', {model: this.getName()});
    
    this.scope('byLevel', function(level){
      this.where({depth: level});
    });    
    
    this.scope('rootOnly', function(){
      this.byLevel(0);
    });
    
    this.scope('withChildren', function(){
      this.include('children');
    });
    
    this.scope('withAllChildren', function(depth){
      if(depth === 1){
        this.withChildren();
      }else{
        this.setInternal('nested_set_with_children_depth', depth);
        this.setInternal('nested_set_with_children', true);
      }
    });
    
    
    
    //helper for withAllChildren
    this.afterFind(function(data, done){
      var with_children = this.getInternal('nested_set_with_children');
      var depth = this.getInternal('nested_set_with_children_depth');
      var records = data.result || [];
      
      if(!util.isArray(records)) records = [records];
      
      //set leaf attribute
      for(var i = 0; i < records.length; i++){
        var record = records[i];
        if(record.lft !== record.rgt - 1){
          record.leaf = false;
        }
      }
      
        
      if(with_children){
        
        if(records && !util.isArray(records)) records = [records];
        
        var ranges = [];
        var range_records = {};
        
        //loop over records and get it's ranges
        for(var i = 0; i < records.length; i++){
          var record = records[i];
          
          if(record.rgt - record.lft > 1){
            ranges.push([record.lft + 1, record.rgt - 1]);
            range_records[record.lft] = record;
          }         
        }

        if(ranges.length > 0){
          var depth_conditions = null;
          
          if(depth) depth_conditions = {depth_lte: depth};
          
          //find all records within that ranges
          return this.model.where({lft_between: ranges}).where(depth_conditions).order('lft').exec(function(children){
            
            for(var i = 0; i < children.length; i++){
              var child = children[i];

              //add all child records to the associated parents. based on lft and rgt
              if(range_records[child.lft - 1]){
                var parent = range_records[child.lft - 1];
                if(parent){
                  parent.children = parent.children || [];
                  parent.children.push(child);
                  range_records[child.lft] = child;
                
                  delete range_records[child.lft - 1];
                  range_records[child.rgt] = parent;
                }
              }
            }
            
            done();
          }).catch(done);
        }
        
      }
      
      done();
    });
    
    
    
    this.beforeCreate(function(record, transaction, done){
      if(record.parent_id){
        //search the parent node
        return self.model.find(record.parent_id).transaction(transaction).exec(function(parent){
          if(parent){
            return self.query().transacting(transaction).where('rgt', '>=', parent.rgt).increment('rgt', 2).then(function(){
              return self.query().transacting(transaction).where('lft', '>', parent.rgt).increment('lft', 2);
            }).then(function(){
              record.lft = parent.rgt; //values before the update - see above
              record.rgt = parent.rgt + 1;
              record.depth = parent.depth + 1;
              done();
            });
          }
          done();
        });
      }else{
        //new root node!
        return self.model.rootOnly().order('rgt', true).limit(1).transaction(transaction).exec(function(root_sibling){
          if(root_sibling){
            record.lft = root_sibling.rgt + 1;
            record.rgt = root_sibling.rgt + 2;
          }else{
            record.lft = 1;
            record.rgt = 2;
          }
          record.depth = 0;
          done();
        });
      }
    });
    
    
    //http://falsinsoft.blogspot.co.at/2013/01/tree-in-sql-database-nested-set-model.html
    
    this.beforeUpdate(function(record, transaction, done){
      if(record.hasChanged('parent_id')){
        if(record.parent_id){
          return self.model.find(record.parent_id).transaction(transaction).exec(function(parent){
            if(parent){
              record.__parent_rgt = parent.rgt; //we need that in the afterUpdate
              record.__depth_diff = record.depth - parent.depth - 1; //we need that in the afterUpdate

              record.depth = parent.depth + 1; //only set the depth - the rest will be done by afterUpdate
              
              done();
            }else{                        
              done("can't find parent node with id " + record.parent_id);
            }
          });
        }else{
          //change to a root node
          return self.model.rootOnly().order('rgt', true).limit(1).transaction(transaction).exec(function(root_sibling){

            if(root_sibling){
              record.__parent_rgt = root_sibling.rgt + 1;
            }else{
              record.__parent_rgt = record.rgt - record.lft;
            }
            
            record.__depth_diff = record.depth;
            record.depth = 0;
            done();
          });
        }
        
      }
      done();
    });
    
        
    //TODO: move afterUpdate into beforeUpdate...
    //changes all nodes if a record got a new parent
    this.afterUpdate(function(record, transaction, done){
      if(record.hasChanged('parent_id')){
        var lft = record.lft;
        var rgt = record.rgt;
        var parent_rgt = record.__parent_rgt;
        var depth_diff = record.__depth_diff;
                
        var raw = self.store.connection.raw;
        
        if(record.__parent_rgt < lft){
          //move the records to the "left"
          self.query().transacting(transaction)
            .whereBetween('lft', [parent_rgt, rgt]).orWhereBetween('rgt', [parent_rgt, rgt])
            .update({
              'rgt': raw([
                'rgt + CASE WHEN',
                'rgt BETWEEN',  lft, 'AND', rgt, //if it's the current record or one of it's children
                  'THEN', (parent_rgt - lft),  
                'WHEN rgt BETWEEN', parent_rgt, 'AND', lft - 1, //if it's a record between the old and the new location
                  'THEN', (rgt - lft + 1),
                'ELSE 0 END'
              ].join(' ')),
              
              'lft': raw([
                'lft + CASE WHEN',
                'lft BETWEEN',  lft, 'AND', rgt, //if it's the current record or one of it's children
                  'THEN', (parent_rgt - lft),
                'WHEN lft BETWEEN', parent_rgt, 'AND', lft - 1, //if it's a record between the old and the new location
                  'THEN', (rgt - lft + 1),
                'ELSE 0 END'
              ].join(' ')),
                
              'depth': raw([
                'CASE WHEN',
                'lft >',  lft, 'AND rgt <', rgt, //if it's any of it's children
                  'THEN depth - ', depth_diff,  
                'ELSE depth END' //dont change the depth
              ].join(' '))
            })
          .then(function(a){
            done();
          });
        }else{
          //move the records to the "right"
          self.query().transacting(transaction)
            .whereBetween('lft', [lft, parent_rgt]).orWhereBetween('rgt', [lft, parent_rgt])
            .update({              
              'rgt': raw([
                'rgt + CASE WHEN',
                'rgt BETWEEN',  lft, 'AND', rgt,  //if it's the current record or one of it's children
                  'THEN', (parent_rgt - rgt - 1),
                'WHEN rgt BETWEEN', rgt + 1, 'AND', parent_rgt - 1, //if it's a record between the old and the new location
                  'THEN', (lft - rgt - 1),
                'ELSE 0 END'
              ].join(' ')),
              
              'lft': raw([
                'lft + CASE WHEN',
                'lft BETWEEN',  lft, 'AND', rgt,  //if it's the current record or one of it's children
                  'THEN', (parent_rgt - rgt - 1),
                'WHEN lft BETWEEN', rgt + 1, 'AND', parent_rgt - 1, //if it's a record between the old and the new location
                  'THEN', (lft - rgt - 1),
                'ELSE 0 END'
              ].join(' ')),
              
              'depth': raw([
                'CASE WHEN',
                'lft >',  lft, 'AND rgt <', rgt, //if it's any of it's children
                  'THEN depth - ', depth_diff,  
                'ELSE depth END' //dont change the depth
              ].join(' '))
            })
          .then(function(){
            done();
          });
        }
      }else{
        done();
      }
    });
    
    
    //handles the deletion of nodes!
    this.afterDestroy(function(record, transaction, done){
      var Model = this.model;
      var raw = self.store.connection.raw;
      
      var width = record.rgt - record.lft + 1;
      
      Model.transaction(transaction).where({lft_between: [record.lft, record.rgt]}).delete().then(function(){
        return self.query().transacting(transaction).where('rgt', '>', record.rgt).update({rgt: raw('rgt - ' + width)})
      }).then(function(){
        return self.query().transacting(transaction).where('lft', '>', record.rgt).update({lft: raw('lft - ' + width)})
      }).then(function(){
        done();
      });
    });
    
    
    
    //Record methods
    
    this.instanceMethods.moveToChildOf = function(id){
      if(typeof id == 'object') id = id.id;
      this.parent_id = id;
    }
    
  }
  
};