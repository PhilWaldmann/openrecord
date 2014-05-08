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
    
    this.hasMany('children', {model: this.getName(), foreign_key: 'parent_id'});
    
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
            
      if(with_children){
        var records = data.result;

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
    
    
    
    
    
    this.beforeCreate(function(record, transaction, done){
      //load parent record  or last sibling to get the correct lft and rgt values
      if(record.parent_id){
        return self.model.where('(id=:id OR parent_id=:id)', {id: record.parent_id}).order('lft', true).limit(1).transaction(transaction).exec(function(parent){
          if(parent){
            if(parent.id != record.parent_id){
              //last sibling
              var sibling = parent;
              record.lft = record.lft || sibling.rgt + 1;
              record.rgt = record.rgt || sibling.rgt + 2;
              record.depth = record.depth || sibling.depth;
            }else{
              //the parent
              record.lft = record.lft || parent.lft + 1;
              record.rgt = record.rgt || record.lft + 1;
              record.depth = record.depth || parent.depth + 1;
            }
          }
          done();
        })
      }
      done();            
    });
    
    
    this.afterCreate(function(record, transaction, done){
      //INCREMENT lft and rgt columns
      self.query().transacting(transaction).where('rgt', '>=', record.lft).where('id', '!=', record.id).increment('rgt', 2).then(function(){
        return self.query().transacting(transaction).where('lft', '>=', record.lft).where('id', '!=', record.id).increment('lft', 2);
      }).then(function(){
        done();
      });
    });
  }
  
};