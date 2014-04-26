module.exports = function(){
  this.seed(function(store, done){
    var User = store.Model('User');

    User.create({login: 'phil'}).then(function(success){
      done();
    });
  });
};