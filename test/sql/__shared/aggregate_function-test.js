var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Aggregate Functions', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store.Model('User', function() {
        this.hasMany('posts')
      })
      store.Model('Post', function() {})
    })

    describe('count()', function() {
      it('returns the right sql', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.count('salary').toSql(function(sql) {
            sql.should.be.equal('select count("salary") "count" from "users"')
          })
        })
      })

      it('returns the right result', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.count('salary').exec(function(result) {
            result.should.be.equal(5)
          })
        })
      })

      it('returns the right result without a param (*)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.count().exec(function(result) {
            result.should.be.equal(5)
          })
        })
      })

      it('works with conditions', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.count('salary')
            .where({ salary_gt: 500 })
            .exec(function(result) {
              result.should.be.equal(1)
            })
        })
      })

      it('works with joins', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.count('salary')
            .leftJoin('posts')
            .exec(function(result) {
              result.should.be.equal(7)
            })
        })
      })
    })

    describe('sum()', function() {
      it('returns the right sql', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.sum('salary').toSql(function(sql) {
            sql.should.be.equal('select sum("salary") "sum" from "users"')
          })
        })
      })

      it('returns the right result', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.sum('salary').exec(function(result) {
            result.should.be.equal(2000)
          })
        })
      })

      it('works with conditions', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.sum('salary')
            .where({ salary_gt: 500 })
            .exec(function(result) {
              result.should.be.equal(1000)
            })
        })
      })

      it('works with joins', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.sum('salary')
            .join('posts')
            .exec(function(result) {
              result.should.be.equal(500)
            })
        })
      })
    })

    describe('max()', function() {
      it('returns the right sql', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.max('salary').toSql(function(sql) {
            sql.should.be.equal('select max("salary") "max" from "users"')
          })
        })
      })

      it('returns the right result', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.max('salary').exec(function(result) {
            result.should.be.equal(1000)
          })
        })
      })

      it('works with conditions', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.max('salary')
            .where({ salary_gt: 500 })
            .exec(function(result) {
              result.should.be.equal(1000)
            })
        })
      })

      it('works with joins', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.max('salary')
            .join('posts')
            .exec(function(result) {
              result.should.be.equal(200)
            })
        })
      })
    })

    describe('min()', function() {
      it('returns the right sql', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.min('salary').toSql(function(sql) {
            sql.should.be.equal('select min("salary") "min" from "users"')
          })
        })
      })

      it('returns the right result', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.min('salary').exec(function(result) {
            result.should.be.equal(100)
          })
        })
      })

      it('works with conditions', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.min('salary')
            .where({ salary_gt: 500 })
            .exec(function(result) {
              result.should.be.equal(1000)
            })
        })
      })

      it('works with joins', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.min('salary')
            .join('posts')
            .exec(function(result) {
              result.should.be.equal(100)
            })
        })
      })
    })

    describe('avg()', function() {
      it('returns the right sql', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.avg('salary').toSql(function(sql) {
            sql.should.be.equal('select avg("salary") "avg" from "users"')
          })
        })
      })

      it('returns the right result', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.avg('salary').exec(function(result) {
            result.should.be.equal(400)
          })
        })
      })

      it('works with conditions', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.avg('salary')
            .where({ salary_gt: 300 })
            .exec(function(result) {
              result.should.be.equal(700)
            })
        })
      })

      it('works with joins', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.avg('salary')
            .leftJoin('posts')
            .exec(function(result) {
              result.should.be.approximately(
                (100 + 100 + 100 + 200 + 400 + 300 + 1000) / 7,
                0.1
              )
            })
        })
      })
    })
  })
}
