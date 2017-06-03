module.exports = function(){
  this.createTable('json_tests', function(){
    this.json('json_attr');
    this.jsonb('jsonb_attr');
  });
};
