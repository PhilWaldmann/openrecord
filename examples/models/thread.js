module.exports = function(){
  this.belongsTo('user');
  this.hasMany('posts');
};