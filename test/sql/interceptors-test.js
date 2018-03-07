var should = require('should')

var Store = require('../../store/sql')

describe('SQL: Interceptors', function(){
  var store = new Store({
    type: 'sql'
  })

  store.Model('User', function(){
    var self = this


    it('has beforeCreate()', function(){
      should.exist(self.beforeCreate)
      self.beforeCreate.should.be.a.Function()
    })

    it('has afterCreate()', function(){
      should.exist(self.afterCreate)
      self.afterCreate.should.be.a.Function()
    })


    it('has beforeUpdate()', function(){
      should.exist(self.beforeUpdate)
      self.beforeUpdate.should.be.a.Function()
    })

    it('has afterUpdate()', function(){
      should.exist(self.afterUpdate)
      self.afterUpdate.should.be.a.Function()
    })


    it('has beforeDestroy()', function(){
      should.exist(self.beforeDestroy)
      self.beforeDestroy.should.be.a.Function()
    })

    it('has afterDestroy()', function(){
      should.exist(self.afterDestroy)
      self.afterDestroy.should.be.a.Function()
    })


    it('has beforeSave()', function(){
      should.exist(self.beforeSave)
      self.beforeSave.should.be.a.Function()
    })

    it('has afterSave()', function(){
      should.exist(self.afterSave)
      self.afterSave.should.be.a.Function()
    })


    it('has beforeFind()', function(){
      should.exist(self.beforeFind)
      self.beforeFind.should.be.a.Function()
    })

    it('has afterFind()', function(){
      should.exist(self.afterFind)
      self.afterFind.should.be.a.Function()
    })


    it('has beforeValidation()', function(){
      should.exist(self.beforeValidation)
      self.beforeValidation.should.be.a.Function()
    })
  })
})
