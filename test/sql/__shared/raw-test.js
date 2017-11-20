var should = require('should');
var Store = require('../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){

  describe(title + ': Raw', function(){
    var store;

    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });


    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);

      store.Model('User', function(){
      });
    });


    it.skip('executes raw queries', function(done){
      console.log('JEAHH')
      store.ready(function(){
        var User = store.Model('User');

        User.raw('SELECT * FROM users', function(users){
          console.log(users)
          should.not.exist(user.email);
          done();
        });
      });
    });

  });

}
