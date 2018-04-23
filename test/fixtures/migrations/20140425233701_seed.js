module.exports = function() {
  this.seed(function(store) {
    var User = store.Model('User')
    return User.create({ login: 'phil' })
  })
}
