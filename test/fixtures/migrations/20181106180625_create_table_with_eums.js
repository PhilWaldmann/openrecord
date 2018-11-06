module.exports = function() {
  this.createTable('with_enums', function() {
    this.enum('foo', { values: ['A', 'B', 'C'] })
    this.enum('bar', { values: ['A1', 'B2', 'C3'] })
    this.enum('foo2', { values: ['A', 'B', 'C'] })
  })
}
