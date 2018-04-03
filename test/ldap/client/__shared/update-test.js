var Store = require('../../../../lib/store')

module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Update (' + storeConf.url + ')', function(){
    var store, targetOu

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)


      targetOu = 'ou=move_target,ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase()
    })


    describe('OU', function(){
      it('returns an error on invalid move', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          return Ou.find('ou=move_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.parent_dn = 'ou=somewhere,' + LDAP_BASE

            return ou.save()
          })
        }).should.be.rejectedWith(store.ValidationError, {errors: {parent_dn: ['not valid']}})
      })


      it('moves an ou to another parent', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          return Ou.find('ou=move_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.parent_dn = targetOu

            return ou.save()
            .then(function(){
              return Ou.find(ou.dn).exec(function(ou){
                ou.name.should.be.equal('move_me_ou')
                ou.parent_dn.should.be.equal(targetOu)
              })
            })
          })
        })
      })


      it('moves an ou to another parent and renames it', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          return Ou.find('ou=move_and_rename_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.name = 'move_me_ou_renamed'
            ou.parent_dn = targetOu

            return ou.save()
            .then(function(){
              return Ou.find(ou.dn).exec(function(ou){
                ou.name.should.be.equal('move_me_ou_renamed')
                ou.parent_dn.should.be.equal(targetOu)
              })
            })
          })
        })
      })


      it('moves an ou to another parent and changes name to uppercase', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          return Ou.find('ou=move_and_rename_me2_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.set({
              name: 'MOVE_AND_RENAME_ME2_OU',
              parent_dn: targetOu
            })

            return ou.save()
            .then(function(){
              return Ou.find(ou.dn).exec(function(ou){
                ou.name.should.be.equal('MOVE_AND_RENAME_ME2_OU')
                ou.parent_dn.should.be.equal(targetOu)
              })
            })
          })
        })
      })


      it('renames an ou', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          return Ou.find('ou=rename_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.name = 'new_name'

            return ou.save()
            .then(function(){
              return Ou.find(ou.dn).exec(function(ou){
                ou.name.should.be.equal('new_name')
                ou.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              })
            })
          })
        })
      })


      it('returns an error on renames with existing object', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          return Ou.find('ou=move_me_test_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.name = 'change_me_ou'

            return ou.save()
          })
        }).should.be.rejectedWith(store.ValidationError, {errors: {sAMAccountName: [ 'already exists' ]}})
      })



      it('changes an ou', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          return Ou.find('ou=change_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.description = 'very important'

            return ou.save()
            .then(function(){
              return Ou.find(ou.dn).exec(function(ou){
                ou.description.should.be.equal('very important')
              })
            })
          })
        })
      })
    })






    describe('Group', function(){
      it('returns an error on invalid move', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          return Group.find('cn=move_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.parent_dn = 'ou=somewhere,' + LDAP_BASE

            return group.save()
          })
        }).should.be.rejectedWith(store.ValidationError, {errors: {parent_dn: [ 'not valid' ]}})
      })


      it('moves an group to another parent', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          return Group.find('cn=move_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.parent_dn = targetOu

            return group.save()
            .then(function(){
              return Group.find(group.dn).exec(function(group){
                group.name.should.be.equal('move_me_group')
                group.parent_dn.should.be.equal(targetOu)
              })
            })
          })
        })
      })


      it('renames a group', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          return Group.find('cn=rename_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.name = 'new_group_name'

            return group.save()
            .then(function(){
              return Group.find(group.dn).exec(function(group){
                group.name.should.be.equal('new_group_name')
                group.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              })
            })
          })
        })
      })


      it('changes a group', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          return Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.description = 'super important'
            group.sAMAccountName = 'ChangedGroup'
            group.groupType = {UNIVERSAL_GROUP: true}

            return group.save()
            .then(function(){
              return Group.find(group.dn).exec(function(group){
                group.description.should.be.equal('super important')
                group.sAMAccountName.should.be.equal('ChangedGroup')
                group.groupType.UNIVERSAL_GROUP.should.be.eql(true)
              })
            })
          })
        })
      })


      it('add members to a group', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          return Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member = ['cn=change_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE]

            return group.save()
            .then(function(){
              return Group.find(group.dn).include('members').exec(function(group){
                group.members.length.should.be.equal(1)
                group.members[0].name.should.be.equal('change_me_user')
              })
            })
          })
        })
      })


      it('returns an error on adding not existing members', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          return Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member = ['cn=not_existing,ou=update_test,ou=openrecord,' + LDAP_BASE]

            return group.save()
          })
        }).should.be.rejectedWith(store.ValidationError, {errors: {member: [ 'unknown member added' ]}})
      })


      it('remove a member from a group', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          return Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member.length.should.be.equal(1)
            group.member = []

            return group.save(function(){
              return Group.find(group.dn).include('members').exec(function(group){
                group.members.length.should.be.equal(0)
              })
            })
          })
        })
      })

      it('returns an error on removing not existing members', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          return Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member = []
            group.changes.member[0] = ['cn=not_existing,ou=update_test,ou=openrecord,' + LDAP_BASE]

            return group.save()
          })
        }).should.be.rejectedWith(store.ValidationError, {errors: {member: [ 'unknown member removed' ]}})
      })



      it('add members to a group via push', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          return Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member.push(
              'cn=change_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE,
              'cn=change_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE
            )

            return group.save(function(){
              return Group.find(group.dn).include('members').exec(function(group){
                group.members.length.should.be.equal(2)
              })
            })
          })
        })
      })


      it('add and remove members to a group via splice', function(){
        return store.ready(function(){
          var Group = store.Model('Group')

          return Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member.splice(0, 1, 'cn=disable_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE)

            return group.save(function(){
              return Group.find(group.dn).include('members').exec(function(group){
                group.members.length.should.be.equal(2)
                group.members[0].name.should.be.equal('disable_me_user')
                group.members[1].name.should.be.equal('change_me_user')
              })
            })
          })
        })
      })
    })






    describe('Computer', function(){
      it('returns an error on invalid move', function(){
        return store.ready(function(){
          var Computer = store.Model('Computer')
          return Computer.find('cn=move_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            computer.parent_dn = 'ou=somewhere,' + LDAP_BASE

            return computer.save()
          })
        }).should.be.rejectedWith(store.ValidationError, {errors: {parent_dn: [ 'not valid' ]}})
      })



      it('moves an computer to another parent', function(){
        return store.ready(function(){
          var Computer = store.Model('Computer')
          return Computer.find('cn=move_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            computer.parent_dn = targetOu

            return computer.save(function(){
              return Computer.find(computer.dn).exec(function(computer){
                computer.name.should.be.equal('move_me_computer')
                computer.parent_dn.should.be.equal(targetOu)
              })
            })
          })
        })
      })


      it('renames a computer', function(){
        return store.ready(function(){
          var Computer = store.Model('Computer')
          return Computer.find('cn=rename_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            computer.name = 'new_computer_name'

            return computer.save(function(){
              return Computer.find(computer.dn).exec(function(computer){
                computer.name.should.be.equal('new_computer_name')
                computer.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              })
            })
          })
        })
      })


      it('changes a computer', function(){
        return store.ready(function(){
          var Computer = store.Model('Computer')
          return Computer.find('cn=change_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            computer.sAMAccountName = 'supercomputer'
            computer.description = 'super very important'

            return computer.save(function(){
              return Computer.find(computer.dn).exec(function(computer){
                computer.description.should.be.equal('super very important')
                computer.sAMAccountName.should.be.equal('supercomputer$')
              })
            })
          })
        })
      })


      it('enable and disables a computer', function(){
        return store.ready(function(){
          var Computer = store.Model('Computer')
          return Computer.find('cn=disable_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            computer.userAccountControl.ACCOUNTDISABLED.should.be.equal(true)
            computer.userAccountControl = {ACCOUNTDISABLED: false, PASSWD_NOTREQUIRED: true, WORKSTATION_TRUST_ACCOUNT: true}

            return computer.save(function(){
              return Computer.find(computer.dn).exec(function(computer){
                computer.userAccountControl.ACCOUNTDISABLED.should.be.equal(false)
                computer.userAccountControl.ACCOUNTDISABLED = true

                return computer.save(function(){
                  return Computer.find(computer.dn).exec(function(computer){
                    computer.userAccountControl.ACCOUNTDISABLED.should.be.equal(true)
                  })
                })
              })
            })
          })
        })
      })
    })






    describe('User', function(){
      it('returns an error on invalid move', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.find('cn=move_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.parent_dn = 'ou=somewhere,' + LDAP_BASE

            return user.save()
          })
        }).should.be.rejectedWith(store.ValidationError, {errors: {parent_dn: [ 'not valid' ]}})
      })





      it('moves an user to another parent', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.find('cn=move_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.parent_dn = targetOu

            return user.save(function(){
              return User.find(user.dn).exec(function(user){
                user.name.should.be.equal('move_me_user')
                user.parent_dn.should.be.equal(targetOu)
              })
            })
          })
        })
      })


      it('renames a user', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.find('cn=rename_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.name = 'new_user_name'

            return user.save(function(){
              return User.find(user.dn).exec(function(user){
                user.name.should.be.equal('new_user_name')
                user.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              })
            })
          })
        })
      })



      it('changes a user', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.find('cn=change_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.sAMAccountName = 'phils_account'
            user.description = 'uber important'
            user.givenName = 'Phil'
            user.sn = 'Waldmann'
            user.userPrincipalName = 'phils_account_long'
            user.mail = 'phil@mail.com'

            return user.save(function(){
              return User.find(user.dn).exec(function(user){
                user.description.should.be.equal('uber important')
                user.sAMAccountName.should.be.equal('phils_account')
                user.givenName.should.be.equal('Phil')
                user.sn.should.be.equal('Waldmann')
                user.userPrincipalName.should.be.equal('phils_account_long')
                user.mail.should.be.equal('phil@mail.com')
              })
            })
          })
        })
      })


      it('resets a user\'s password', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.find('cn=reset_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.unicodePwd = 'super5e(reT!'
            user.userAccountControl = {NORMAL_ACCOUNT: true} // by default all dummy users are disabled

            return user.save(function(){
              return user.checkPassword('super5e(reT!')
            })
          })
        })
      })


      it('resets a user\'s password with password expiration', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.find('cn=reset_me_user2,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.unicodePwd = 'super5e(reT2!'
            user.userAccountControl = {NORMAL_ACCOUNT: true} // by default all dummy users are disabled

            return user.save(function(){
              user.unicodePwd = 'super5e(reT3!'
              user.userAccountControl.PASSWORD_EXPIRED = true
              user.pwdLastSet = 0

              return user.save(function(){
                return user.checkPassword('super5e(reT3!')
              })
            })
          })
        }).should.be.rejectedWith(store.ValidationError, {errors: {base: [ 'user must reset password' ]}})
      })



      it('disables a user', function(){
        return store.ready(function(){
          var User = store.Model('User')
          return User.find('cn=disable_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.unicodePwd = 'super5e(reT5!'
            user.userAccountControl = {NORMAL_ACCOUNT: true, ACCOUNTDISABLED: true} // by default all dummy users are disabled

            return user.save(function(){
              return user.checkPassword('super5e(reT5!')
            })
          })
        }).should.be.rejectedWith(store.ValidationError, {errors: {base: [ 'account disabled' ]}})
      })
    })
  })
}
