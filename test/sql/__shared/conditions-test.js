var should = require('should')
var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Conditions', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      store = new Store(storeConf)

      store.addOperator(
        'is_phil',
        function(attr, value, query, cond) {
          if (value) query.where(attr, 'like', '%phil%')
        },
        {
          on: { all: false, boolean: true }
        }
      )

      store.addOperator('length', {
        on: {
          number: function(attr, value, query, cond) {
            var fn = 'char_length'
            if (store.type === 'sqlite3' || store.type === 'oracle')
              fn = 'length'
            query.whereRaw(fn + '(' + this.escapeAttribute(attr) + ') = ?', [
              value
            ])
          },
          array: function(attr, value, query, cond) {
            var min = value[0]
            var max = value[1]
            var fn = 'char_length'
            if (store.type === 'sqlite3' || store.type === 'oracle')
              fn = 'length'
            query.whereRaw(
              fn + '(' + this.escapeAttribute(attr) + ') BETWEEN ? AND ?',
              [min, max]
            )
          }
        }
      })

      store.appendOperator('string', 'is_phil')
      store.appendOperator('string', 'length')

      store.Model('User', function() {
        this.attribute('created_at', 'date')
      })
    })

    describe('find()', function() {
      it('returns null on empry result', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(99).exec(function(result) {
            should.not.exist(result)
          })
        })
      })

      it('returns null if id === null', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(null).exec(function(result) {
            should.not.exist(result)
          })
        })
      })

      it('returns null if id === undefined', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(undefined).exec(function(result) {
            should.not.exist(result)
          })
        })
      })

      it('returns null if called without an argument', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find().exec(function(result) {
            should.not.exist(result)
          })
        })
      })

      it('finds phil with id 1', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(1).exec(function(result) {
            result.login.should.be.equal('phil')
          })
        })
      })

      it('finds phil with id 1 (without exec)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find(1, function(result) {
            result.login.should.be.equal('phil')
          })
        })
      })

      /*
      it('finds with multiple ids returns the right sql', function(){
        return store.ready(function(){
          var User = store.Model('User');
          return User.find([1, 2]).toSql(function(sql){
            sql.should.be.equal('select * from "users" where "users"."id" in (1, 2)');
            ;
          })
        });
      });
    */

      it('finds phil and michl by id', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find([1, 2]).exec(function(result) {
            result.length.should.be.equal(2)
            result[0].login.should.be.equal('phil')
            result[1].login.should.be.equal('michl')
          })
        })
      })

      it('finds phil and michl by id with reverse order', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.find([1, 2])
            .order('id', true)
            .exec(function(result) {
              result.length.should.be.equal(2)
              result[0].login.should.be.equal('michl')
              result[1].login.should.be.equal('phil')
            })
        })
      })
    })

    describe('get()', function() {
      /*
      it('finds with one id returns the right sql', function(){
        return store.ready(function(){
          var User = store.Model('User');
          return User.get(1).toSql(function(sql){
            sql.should.be.equal('select * from "users" where "users"."id" = 1 limit 1');
            ;
          })
        });
      });
    */

      it('finds someting', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.get(1).exec(function(result) {
            should.exist(result)
          })
        })
      })

      it('returns a RecordNotFound error', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.get(99)
            .exec(function(result) {
              should.not.exist(result)
            })
            .catch(function(err) {
              err.should.be.an.instanceOf(Error)
            })
        })
      })
    })

    describe('limit()', function() {
      it('finds the first 2 users', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.limit(2)
            .order('id')
            .exec(function(users) {
              users.length.should.be.equal(2)

              users[0].login.should.be.equal('phil')
              users[1].login.should.be.equal('michl')
            })
        })
      })
    })

    describe('offset()', function() {
      it('finds the last 2 users', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.offset(1).exec(function(users) {
            users.length.should.be.equal(2)

            users[0].login.should.be.equal('michl')
            users[1].login.should.be.equal('admin')
          })
        })
      })
    })

    describe('where()', function() {
      it('where with like returns the right sql', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login_like: 'phi' }).toSql(function(sql) {
            sql.should.be.equal(
              'select * from "users" where "users"."login" like \'%phi%\''
            )
          })
        })
      })

      it('finds phil with like', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login_like: 'ph' }).exec(function(result) {
            result.length.should.be.equal(1)
            result[0].login.should.be.equal('phil')
          })
        })
      })

      it('finds phil with like (without exec)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login_like: 'ph' }, function(result) {
            result.length.should.be.equal(1)
            result[0].login.should.be.equal('phil')
          })
        })
      })

      it('finds phil with array condition', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where(['login = ?', 'phil']).exec(function(result) {
            result.length.should.be.equal(1)
            result[0].login.should.be.equal('phil')
          })
        })
      })

      it('finds phil with array condition (IN (name))', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where(['login IN (?)', ['phil']]).exec(function(result) {
            result.length.should.be.equal(1)
            result[0].login.should.be.equal('phil')
          })
        })
      })

      it('finds phil and michl with array condition (IN (ids))', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where(['id IN (?)', [1, 2]]).exec(function(result) {
            result.length.should.be.equal(2)
            result[0].login.should.be.equal('phil')
            result[1].login.should.be.equal('michl')
          })
        })
      })

      it('finds phil and michl with array condition (IN (ids) login = ?)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where(['id IN (?) OR login = ?', [1, 2], 'phil']).exec(
            function(result) {
              result.length.should.be.equal(2)
              result[0].login.should.be.equal('phil')
              result[1].login.should.be.equal('michl')
            }
          )
        })
      })

      it('finds phil and michl with array condition (IN (names))', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where(['login IN (?)', ['phil', 'michl']]).exec(function(
            result
          ) {
            result.length.should.be.equal(2)
            result[0].login.should.be.equal('phil')
            result[1].login.should.be.equal('michl')
          })
        })
      })

      it('finds NOT michl and admin', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login_not: ['michl', 'admin'] }).exec(function(
            result
          ) {
            result.length.should.be.equal(1)
            result[0].login.should.be.equal('phil')
          })
        })
      })

      it('finds michl and admin with like', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login_like: ['mich', 'adm'] })
            .order('login')
            .exec(function(result) {
              result.length.should.be.equal(2)
              result[0].login.should.be.equal('admin')
              result[1].login.should.be.equal('michl')
            })
        })
      })

      it('finds nothing with empty array in condition (IS NULL)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login: [] }).exec(function(result) {
            result.length.should.be.equal(0)
          })
        })
      })

      it('finds nothing with IS NULL condition', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login: null }).exec(function(result) {
            result.length.should.be.equal(0)
          })
        })
      })

      it('finds nothing with IS NULL condition (undefined)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login: undefined }).exec(function(result) {
            result.length.should.be.equal(0)
          })
        })
      })

      it('finds all with IS NOT NULL condition', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login_not: null }).exec(function(result) {
            result.length.should.be.greaterThan(0)
          })
        })
      })

      it('finds all with IS NOT NULL condition (undefined)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login_not: undefined }).exec(function(result) {
            result.length.should.be.greaterThan(0)
          })
        })
      })

      it('finds all where created_at is greater than 2014-01-05', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ created_at_gt: '2014-01-05' }).exec(function(
            result
          ) {
            result.length.should.be.equal(1)
          })
        })
      })

      it('finds all where created_at is greater than equal 2014-01-05', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ created_at_gte: '2014-01-05' }).exec(function(
            result
          ) {
            result.length.should.be.equal(2)
          })
        })
      })

      it('finds all where created_at is lower than 2014-01-05', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ created_at_lt: '2014-01-05' }).exec(function(
            result
          ) {
            result.length.should.be.equal(1)
          })
        })
      })

      it('finds all where created_at is lower than equal 2014-01-05', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ created_at_lte: '2014-01-05' }).exec(function(
            result
          ) {
            result.length.should.be.equal(2)
          })
        })
      })

      it('finds all where created_at is between 2014-01-05 and 2014-01-20', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({
            created_at_between: ['2014-01-05', '2014-01-20']
          }).exec(function(result) {
            result.length.should.be.equal(2)
          })
        })
      })

      it('finds all where created_at is between (2014-01-09 and 2014-01-20) and (2014-01-01 and 2014-01-04)', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({
            created_at_between: [
              ['2014-01-09', '2014-01-20'],
              ['2014-01-01', '2014-01-04']
            ]
          }).exec(function(result) {
            result.length.should.be.equal(2)
          })
        })
      })

      it('finds all where email attribute equal private_email attribute', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ email: { $attribute: 'private_email' } }).exec(
            function(result) {
              result.length.should.be.equal(1)
            }
          )
        })
      })

      it('finds with custom operator', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login_is_phil: true }).exec(function(result) {
            result.length.should.be.equal(1)
          })
        })
      })

      it('another custom operator with multiple input types', function() {
        return store.ready(function() {
          var User = store.Model('User')
          return User.where({ login_length: 4 })
            .exec(function(result) {
              result.length.should.be.equal(1)
            })
            .then(function() {
              return User.where({ login_length: [4, 6] }).exec(function(
                result
              ) {
                result.length.should.be.equal(3)
              })
            })
        })
      })

      it('throws an error on invalid use of custom operator', function() {
        return store
          .ready(function() {
            var User = store.Model('User')
            return User.where({ login_length: 'awesome?' }).exec(function(
              result
            ) {
              result.length.should.be.equal(1)
            })
          })
          .should.be.rejectedWith(Error, {
            message:
              "Operator 'length' of attribute 'login' (type 'string') can't process value of type 'string'"
          })
      })
    })
  })
}
