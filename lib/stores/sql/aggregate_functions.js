/*
 * MODEL
 */
exports.model = {
  /**
   * Count the number of records in the database (SQL: `COUNT()`)
   * @area Model
   * @method count
   * @param {string} field - Optional field name. (Default: `*`)
   * @return {Model}
   * @see Model.exec()
   */
  count: function(field){
    var self = this.chain();
    self.setInternal('count', field || '*'); 
    return self;
  },
  
  /**
   * Calculates the sum of a certain field (SQL: `SUM()`)
   * @area Model
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
   * @area Model
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
   * @area Model
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
      
      for(var i in agg_fns){
        var tmp = this.getInternal(agg_fns[i]);

        if(tmp){
          query[agg_fns[i]].call(query, tmp + ' as ' + agg_fns[i]);
        }
      }
                  
      return true;
    }, 80);
    
    
    
    this.afterFind(function(data){
      var count = this.getInternal('count');
      var sum = this.getInternal('sum');
      var min = this.getInternal('min');
      var max = this.getInternal('max');
      var avg = this.getInternal('avg');
      
      if((count || sum || min || max || avg) && data.result.length == 1){
        this.asJson();
        data.result = data.result[0];
      }
      
      return true;
    }, 70);
    
  }
};