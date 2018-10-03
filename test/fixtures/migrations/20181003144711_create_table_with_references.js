module.exports = function() {
  this.createTable('with_references', function() {
    this.integer('post_id', { references: 'posts.id', unsigned: true })
  })
}
