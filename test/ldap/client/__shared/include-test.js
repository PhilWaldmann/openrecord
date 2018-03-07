var Store = require('../../../../lib/store')

module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Include (' + storeConf.url + ')', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
    })


    it('get child objects (one level)!', function(){
      return store.ready(function(){
        var Ou = store.Model('OrganizationalUnit')
        return Ou.searchRoot('ou=openrecord,' + LDAP_BASE).include('children').exec(function(ous){
          ous.length.should.be.equal(1)
          ous[0].children.length.should.be.equal(4)
          ous[0].children[0].children.length.should.be.equal(0)
        })
      })
    })

    it('get all recursive child objects!', function(){
      return store.ready(function(){
        var Ou = store.Model('OrganizationalUnit')
        return Ou.searchRoot('ou=openrecord,' + LDAP_BASE).include('all_children').exec(function(ous){
          ous.length.should.be.equal(1)
          ous[0].all_children.length.should.not.be.equal(0)
        })
      })
    })
  })
}
