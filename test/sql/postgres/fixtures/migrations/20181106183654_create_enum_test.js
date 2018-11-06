module.exports = function() {
  this.enum('my_enum', ['foo', 'bar'])
  this.createTable('enum_tests', function() {
    this.type('my_enum', 'enum_attribute')
  })
}
