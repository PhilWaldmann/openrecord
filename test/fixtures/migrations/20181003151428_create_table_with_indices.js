module.exports = function() {
  this.createTable('with_indices', function() {
    this.integer('foo', { unique: true })
    this.integer('bar')
  })

  this.createIndex('with_indices', 'bar')
}
