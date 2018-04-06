var should = require('should')
var Store = require('../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': AutoJoin', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)


      store.Model('User', function(){
        this.hasMany('posts')
        this.hasMany('threads')
        this.autoJoin()
      })
      store.Model('Post', function(){
        this.belongsTo('user')
        this.belongsTo('thread')
        this.autoJoin()
      })
      store.Model('Thread', function(){
        this.belongsTo('user')
        this.hasMany('posts')
        this.autoJoin()
      })
    })



    describe('autoJoin()', function(){
      it('returns the right results on nested joins with nested conditions', function(){
        return store.ready(function(){
          var Thread = store.Model('Thread')
          return Thread.where({posts: {user: {login_like: 'phi'}}}, {title_like: 'first'}).order('title', 'posts_user.id').exec(function(result){            
            result[0].title.should.be.equal('first thread')
            result[0]._posts.length.should.be.equal(2)
            result[0]._posts[0]._user.login.should.be.equal('phil')
            result[0]._posts[1]._user.login.should.be.equal('phil')
            should.not.exist(result[1])
          })
        })
      })
    })
  })
}
