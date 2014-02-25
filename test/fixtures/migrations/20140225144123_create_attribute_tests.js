module.exports = function(){
  this.createTable('attribute_tests', function(){
    this.string('string_attr');
    this.text('text_attr');
    this.integer('integer_attr');
    this.float('float_attr');
    this.boolean('boolean_attr');
    this.binary('binary_attr');
    this.date('date_attr');
    this.datetime('datetime_attr');
    this.time('time_attr');
  });
};