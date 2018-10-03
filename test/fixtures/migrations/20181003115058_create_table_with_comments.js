module.exports = function() {
  this.createTable('with_comments', function() {
    this.integer('foo', { comment: 'foobar' })
  })
}
