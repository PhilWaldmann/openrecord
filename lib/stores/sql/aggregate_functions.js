/*
 * MODEL
 */
exports.model = {
  /**
   * Count the number of records in the database (SQL: `COUNT()`)
   *
   * @class Model
   * @method count
   * @param {string} field - Optional field name. (Default: `*`)
   * @param {boolean} distinct - Optional: DISTINCT(field). (Default: false)
   * @return {Model}
   * @see Model.exec()
   */
  count: function(field, distinct){
    var self = this.chain();
    self.setInternal('count', field || '*'); 
    self.setInternal('count_distinct', distinct || false);
    return self;
  },
  
  /**
   * Calculates the sum of a certain field (SQL: `SUM()`)
   *
   * @class Model
   * @method sum
   * @param {string} field - The field name.
   * @return {Model}
   * @see Model.exec()
   */
  sum: function(field){
    var self = this.chain();  
    self.setInternal('sum', field);  
    return self;
  },
  
  /**
   * Calculates the maximum value of a certain field (SQL: `MAX()`)
   *
   * @class Model
   * @method max
   * @param {string} field - The field name.
   * @return {Model}
   * @see Model.exec()
   */
  max: function(field){
    var self = this.chain();  
    self.setInternal('max', field);  
    return self;
  },
  
  /**
   * Calculates the minimum value of a certain field (SQL: `MIN()`)
   *
   * @class Model
   * @method min
   * @param {string} field - The field name.
   * @return {Model}
   * @see Model.exec()
   */
  min: function(field){
    var self = this.chain();  
    self.setInternal('min', field);  
    return self;
  },
  
  /* //Not yet supported by knex (?)
  avg: function(field){
    var self = this.chain();  
    self.setInternal('avg', field);  
    return self;
  }
  */
};



/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    var self = this;    

    this.beforeFind(function(query){  
      var agg_fns = ['count', 'sum', 'min', 'max']; //, 'avg'];
      var count_distinct = this.getInternal('count_distinct');
      
      
      for(var i in agg_fns){
        var tmp = this.getInternal(agg_fns[i]);

        if(tmp){
          if(agg_fns[i] == 'count' && count_distinct){
            query.select(self.store.connection.raw('count(distinct(' + tmp + ')) as count'));
          }else{
            query[agg_fns[i]].call(query, tmp + ' as ' + agg_fns[i]);
          }
          
        }
      }
                  
      return true;
    }, -30);
    
    
    
    this.afterFind(function(data){
      self.logger.trace('sql/aggregate_functions', data);
      var count = this.getInternal('count');
      var sum = this.getInternal('sum');
      var min = this.getInternal('min');
      var max = this.getInternal('max');
      var avg = this.getInternal('avg');
            
      if((count || sum || min || max || avg) && data.result.length <= 1){
        
        this.asJson();
        
        if(data.result.length === 0){
          data.result = 0;
          return true;
        }
        
        
        data.result = data.result[0];
        
        var agg_fns = ['count', 'sum', 'min', 'max']; //, 'avg'];
        var fns = 0;
        var last_fn;
        
        for(var i in agg_fns){
          if(data.result[agg_fns[i]] !== undefined){
            data.result[agg_fns[i]] = parseFloat(data.result[agg_fns[i]]);
            fns++;
            last_fn = agg_fns[i];
          }
        }
        
        if(fns === 1){
          data.result = data.result[last_fn];
        }
        
      }
      
      return true;
    }, 70);
    
  }
};