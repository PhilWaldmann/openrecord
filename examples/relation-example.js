/**
 * Add a has many relation to the `User` Model
 * @example Definition.hasMany
 */
store.model('User', function(){
 this.hasMany('posts');
});

/**
 * Add a belongs to relation to the `Post` Model
 * @example Definition.belongsTo
 */
store.model('Post', function(){
 this.hasMany('users');
});