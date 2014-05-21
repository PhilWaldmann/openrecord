
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
      
      if(!(records instanceof Array)) records = [records];
      
      //set leaf attribute
      for(var i = 0; i < records.length; i++){
        var record = records[i];
        if(record.lft !== record.rgt - 1){
          record.attributes.leaf = false;
        }
      }
      
        
      if(with_children){
        
        if(records && !(records instanceof Array)) records = [records];
        
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
                parent.children.add(child);
                range_records[child.lft] = child;
                
                delete range_records[child.lft - 1];
                range_records[child.rgt] = parent;
              }
            }
            
            done();
          }).catch(done);
        }
        
      }
      
      done();
    });
    
    
    
    
    //searches the parent and next sibling to set the lft, rgt and depth for a new record  + depth only for updated records with a new parent
    this.beforeSave(function(record, transaction, done){
      //load parent record  or last sibling to get the correct lft and rgt values
      if(record.parent_id && record.hasChanged('parent_id')){
        
        return self.model.where('(id=:id OR parent_id=:id)', {id: record.parent_id}).order('rgt', true).limit(2).transaction(transaction).exec(function(parent_and_sibling){
          if(parent_and_sibling){

            var parent = parent_and_sibling[0];
            var sibling = parent_and_sibling[1];
            
            if(!record.__exists){
              // A CREATE
              if(sibling){
                //last sibling
                record.lft = sibling.rgt + 1;
                record.rgt = sibling.rgt + 2;
                record.depth = sibling.depth;
              }else{
                //the parent
                record.lft = parent.lft + 1;
                record.rgt = record.lft + 1;
                record.depth = parent.depth + 1;
              }
              
            }else{
              //AN UPDATE
              record.depth = parent.depth + 1; //only set the depth - the rest will be done by afterUpdate
              record.__parent_rgt = parent.rgt; //we need that in the afterUpdate
            }
          }
          done();
        });
        
      }
      done();            
    });
    
    
    //moves following nodes to create space for the new one
    this.afterCreate(function(record, transaction, done){
      //INCREMENT lft and rgt columns
      self.query().transacting(transaction).where('rgt', '>=', record.lft).where('id', '!=', record.id).increment('rgt', 2).then(function(){
        return self.query().transacting(transaction).where('lft', '>=', record.lft).where('id', '!=', record.id).increment('lft', 2);
      }).then(function(){
        done();
      });
    });
    
    
    
    //changes all nodes if a record got a new parent
    this.afterUpdate(function(record, transaction, done){
      if(record.hasChanged('parent_id')){
        var lft = record.lft;
        var rgt = record.rgt;
        var parent_rgt = record.__parent_rgt;
        
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
              ].join(' '))
            })
          .then(function(a){
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