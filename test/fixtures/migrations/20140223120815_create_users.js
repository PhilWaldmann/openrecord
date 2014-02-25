module.exports = function(){
  this.createTable('users', function(){
    this.string('login', {not_null: true});
    this.string('first_name');
  });
};