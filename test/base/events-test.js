var should = require('should')

var Store = require('../../store/base')

describe('Events', function(){
  var store = new Store()

  before(function(){
    return store.ready()
  })



  store.Model('User', function(){
    var self = this


    describe('Definition', function(){
      describe('emit()', function(){
        it('methods exists', function(){
          self.emit.should.be.a.Function()
          self.on.should.be.a.Function()
        })
      })
    })


    self.attribute('login', String)

    self.on('record_to_definition_test_event', function(arg1, arg2, done){
      this.login.should.be.equal('phil')
      arg1.should.be.equal('argument1')
      arg2.should.be.equal('argument2')
      done()
    })
  })



  describe('Model', function(){
    describe('emit()', function(){
      it('does not exists', function(){
        var User = store.Model('User')
        should.not.exist(User.emit)
        should.not.exist(User.on)
      })
    })
  })


  describe('Record', function(){
    describe('emit()', function(){
      it('does not exists', function(){
        var User = store.Model('User')
        var record = new User()

        should.not.exist(record.emit)
        should.not.exist(record.on)
      })
    })
  })
})
