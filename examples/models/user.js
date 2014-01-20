module.exports = function(){
  this.hasMany('posts');
  
  //this.validatesUniquenessOf('email');

  this.on('email_changed', function(old, _new){
    console.log('CHANGED EMAIL FROM', old, 'TO', _new);
  });
  
  this.fullName = function(){
    return 'Hans';
  };
  
  this.scope('test', function(){
    
  });
};