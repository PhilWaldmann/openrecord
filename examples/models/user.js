module.exports = function(){
  this.hasMany('posts');
  this.hasMany('threads');
  
  //this.validatesUniquenessOf('email');

  
  this.fullName = function(){
    return 'Hans';
  };
  
  this.scope('test', function(){
    
  });
};