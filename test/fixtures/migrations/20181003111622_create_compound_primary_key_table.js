module.exports = function() {
  this.createTable('compound_primary_keys', {id: false}, function() {
    this.integer('foo', { primary: true })
    this.string('bar', { primary: true })
  })
}
