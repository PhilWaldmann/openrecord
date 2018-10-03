module.exports = function() {
  this.createTable('with_comments', {comment: 'foobar table'}, function() {
    this.integer('foo', { comment: 'foobar' })
  })
}
