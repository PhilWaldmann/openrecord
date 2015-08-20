module.exports = function(){
  this.createTable('attribute_tests', function(){
    var self = this;
    
    this.run(function(){
      self.string('string_attr');
    });
    
    
    this.text('text_attr');
    this.integer('integer_attr');
    this.float('float_attr');
    this.boolean('boolean_attr');
    this.binary('binary_attr');
    this.date('date_attr');
    this.datetime('datetime_attr');
    this.time('time_attr');
    

    this.text('with_default_text', {default:'foo'});
    this.integer('with_default_integer', {default:55});
    this.boolean('with_default_boolean', {default:true});
  });
};