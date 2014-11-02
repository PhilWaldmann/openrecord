/*
 * STORE
 */
exports.store = {    
  mixinCallback: function(){

    this.addInterceptor('beforeInclude');
    this.addInterceptor('onInclude');    
    this.addInterceptor('afterInclude');      
    
  }
};