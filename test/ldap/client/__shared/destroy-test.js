var should = require('should')
var Store = require('../../../../lib/store')

module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Destroy (' + storeConf.url + ')', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
    })




    describe('OU', function(){
      it('destroys an ou', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          return Ou.find('ou=destroy_me_ou,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            return ou.destroy(function(){
              return Ou.find('ou=destroy_me_ou,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
                should.not.exist(ou)
              })
            })
          })
        })
      })



      it('returns an error on ou destroys with children', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          return Ou.find('ou=destroy_me_sub_ou,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            return ou.destroy()
          })
        }).should.be.rejectedWith(store.ValidationError)
      })


      it('destroys ou with all children', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          return Ou.find('ou=destroy_me_sub_ou,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            return ou.destroyAll(function(){
              return Ou.find('ou=destroy_test,ou=openrecord,' + LDAP_BASE).include('ous').exec(function(ou){
                ou.ous.length.should.be.equal(0)
              })
            })
          })
        })
      })
    })







    describe('Group', function(){
      it('destroys a group', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          return Group.find('cn=destroy_me_group,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            return group.destroy(function(){
              return Group.find('cn=destroy_me_group,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
                should.not.exist(group)
              })
            })
          })
        })
      })
    })






    describe('Computer', function(){
      it('destroys a computer', function(){
        return store.ready(function(){
          var Computer = store.Model('Computer')
          return Computer.find('cn=destroy_me_computer,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            return computer.destroy(function(){
              return Computer.find('cn=destroy_me_computer,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
                should.not.exist(computer)
              })
            })
          })
        })
      })
    })






    describe('User', function(){
      it('destroys a user', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.find('cn=destroy_me_user,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            return user.destroy(function(){
              return User.find('cn=destroy_me_user,ou=destroy_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
                should.not.exist(user)
              })
            })
          })
        })
      })
    })
  })
}
