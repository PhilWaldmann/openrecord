/*
 * STORE
 */
exports.store = {    
  mixinCallback: function(){   
    this.addInterceptor('beforeFind');
    this.addInterceptor('beforeCreate');
    this.addInterceptor('beforeUpdate');
    this.addInterceptor('beforeSave');
    this.addInterceptor('beforeDestroy');
    
    this.addInterceptor('afterFind');
    this.addInterceptor('afterCreate');
    this.addInterceptor('afterUpdate');
    this.addInterceptor('afterSave');
    this.addInterceptor('afterDestroy');
  },
};