module.exports = function(){
  this.createTable('posts', function(){
    this.string('message');
  });
};