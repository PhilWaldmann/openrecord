var Store = require('../../store/base')

describe('Attributes', function(){
  var store = new Store()

  store.Model('User', function(){
    this.attribute('my_str', String, {})
  })

  before(function(){
    return store.ready()
  })


  describe('store instance', function(){
    it('has BaseModel', function(){
      store.BaseModel.should.be.a.Function()
    })
  })

  describe('Store constructor', function(){
    it('has BaseModel', function(){      
      Store.BaseModel.should.be.a.Function()
    })
  })
})
