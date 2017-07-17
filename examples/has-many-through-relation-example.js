/**
 * Add belongs to relations to a junction table connecting
 * Post and Category
 * @example Definition.belongsTo
 */
store.model('PostsCategory', function(){
  this.belongsTo('post')
  this.belongsTo('category')
})

/**
 * Add relations for the junction table and
 * for the category table via the junction table
 * @example Definition.hasManyThrough
 */
store.model('Post', function(){
  this.hasMany('posts_category')
  this.hasMany('category', {through: 'posts_category'})
})

/**
 * Add relations for the junction table and
 * for the category table via the junction table
 * @example Definition.hasManyThrough
 */
store.model('Category', function(){
  this.hasMany('posts_category')
  this.hasMany('post', {through: 'posts_category'})
})

/* Now create a post with categories (after creating your store): */
var Post = store.Model('Post')
var Category = store.Model('Category')

var post = new Post()
var c1 = new Category()
var c2 = new Category()
post.category = [c1, c2]
