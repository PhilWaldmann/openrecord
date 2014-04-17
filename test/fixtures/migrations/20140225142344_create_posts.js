module.exports = function(){
  this.createTable('posts', function(){
    this.string('messages', {default: 'no message'});
    this.string('foo');
    
    this.stampable();
    this.polymorph('foo');
    this.nestedSet();
    this.paranoid();
  });
};