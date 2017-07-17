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
      store.setMaxListeners(0)

      targetOu = 'ou=move_target,ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase()
    })


    describe('OU', function(){
      it('returns an error on invalid move', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          Ou.find('ou=move_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.parent_dn = 'ou=somewhere,' + LDAP_BASE

            ou.save(function(success){
              success.should.be.equal(false)
              ou.errors.should.be.eql({ parent_dn: [ 'not valid' ] })
              next()
            })
          })
        })
      })


      it('returns an error on invalid name', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          Ou.find('ou=move_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.name = 'cn=foooo'

            ou.save(function(success){
              success.should.be.equal(false)
              ou.errors.should.be.eql({ name: [ 'not valid' ] })
              next()
            })
          })
        })
      })


      it('moves an ou to another parent', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          Ou.find('ou=move_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.parent_dn = targetOu

            ou.save(function(success){
              success.should.be.equal(true)

              Ou.find(ou.dn).exec(function(ou){
                ou.name.should.be.equal('move_me_ou')
                ou.parent_dn.should.be.equal(targetOu)

                next()
              })
            })
          })
        })
      })


      it('moves an ou to another parent and renames it', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          Ou.find('ou=move_and_rename_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.name = 'move_me_ou_renamed'
            ou.parent_dn = targetOu

            ou.save(function(success){
              success.should.be.equal(true)

              Ou.find(ou.dn).exec(function(ou){
                ou.name.should.be.equal('move_me_ou_renamed')
                ou.parent_dn.should.be.equal(targetOu)

                next()
              })
            })
          })
        })
      })


      it('moves an ou to another parent and changes name to uppercase', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          Ou.find('ou=move_and_rename_me2_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.set({
              name: 'MOVE_AND_RENAME_ME2_OU',
              parent_dn: targetOu
            })

            ou.save(function(success){
              success.should.be.equal(true)

              Ou.find(ou.dn).exec(function(ou){
                ou.name.should.be.equal('MOVE_AND_RENAME_ME2_OU')
                ou.parent_dn.should.be.equal(targetOu)

                next()
              })
            })
          })
        })
      })


      it('renames an ou', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          Ou.find('ou=rename_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.name = 'new_name'

            ou.save(function(success){
              success.should.be.equal(true)

              Ou.find(ou.dn).exec(function(ou){
                ou.name.should.be.equal('new_name')
                ou.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase())

                next()
              })
            })
          })
        })
      })


      it('returns an error on renames with existing object', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          Ou.find('ou=move_me_test_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.name = 'change_me_ou'

            ou.save(function(success){
              success.should.be.equal(false)
              this.errors.should.be.eql({ sAMAccountName: [ 'already exists' ] }) // TODO: should name, right?
              next()
            })
          })
        })
      })


      it('returns an error on invalid characters in name', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          Ou.find('ou=move_me_test_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.name = '#test'

            ou.save(function(success){
              success.should.be.equal(false)
              this.errors.should.be.eql({ name: [ 'not valid' ] })
              next()
            })
          })
        })
      })


      it('changes an ou', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          Ou.find('ou=change_me_ou,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(ou){
            ou.description = 'very important'

            ou.save(function(success){
              success.should.be.equal(true)

              Ou.find(ou.dn).exec(function(ou){
                ou.description.should.be.equal('very important')
                next()
              })
            })
          })
        })
      })
    })






    describe('Group', function(){
      it('returns an error on invalid move', function(next){
        store.ready(function(){
          var Group = store.Model('Group')
          Group.find('cn=move_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.parent_dn = 'ou=somewhere,' + LDAP_BASE

            group.save(function(success){
              success.should.be.equal(false)
              group.errors.should.be.eql({ parent_dn: [ 'not valid' ] })
              next()
            })
          })
        })
      })

      it('returns an error on invalid name', function(next){
        store.ready(function(){
          var Group = store.Model('Group')
          Group.find('cn=rename_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.name = 'cn=foooo'

            group.save(function(success){
              success.should.be.equal(false)
              group.errors.should.be.eql({ name: [ 'not valid' ] })
              next()
            })
          })
        })
      })


      it('moves an group to another parent', function(next){
        store.ready(function(){
          var Group = store.Model('Group')
          Group.find('cn=move_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.parent_dn = targetOu

            group.save(function(success){
              success.should.be.equal(true)

              Group.find(group.dn).exec(function(group){
                group.name.should.be.equal('move_me_group')
                group.parent_dn.should.be.equal(targetOu)

                next()
              })
            })
          })
        })
      })


      it('renames a group', function(next){
        store.ready(function(){
          var Group = store.Model('Group')
          Group.find('cn=rename_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.name = 'new_group_name'

            group.save(function(success){
              success.should.be.equal(true)

              Group.find(group.dn).exec(function(group){
                group.name.should.be.equal('new_group_name')
                group.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase())

                next()
              })
            })
          })
        })
      })


      it('changes a group', function(next){
        store.ready(function(){
          var Group = store.Model('Group')
          Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.description = 'super important'
            group.sAMAccountName = 'ChangedGroup'
            group.groupType = {UNIVERSAL_GROUP: true}

            group.save(function(success){
              success.should.be.equal(true)

              Group.find(group.dn).exec(function(group){
                group.description.should.be.equal('super important')
                group.sAMAccountName.should.be.equal('ChangedGroup')
                group.groupType.UNIVERSAL_GROUP.should.be.eql(true)

                next()
              })
            })
          })
        })
      })


      it('add members to a group', function(next){
        store.ready(function(){
          var Group = store.Model('Group')
          Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member = ['cn=change_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE]

            group.save(function(success){
              success.should.be.equal(true)

              Group.find(group.dn).include('members').exec(function(group){
                group.members.length.should.be.equal(1)
                group.members[0].name.should.be.equal('change_me_user')

                next()
              })
            })
          })
        })
      })


      it('returns an error on adding not existing members', function(next){
        store.ready(function(){
          var Group = store.Model('Group')
          Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member = ['cn=not_existing,ou=update_test,ou=openrecord,' + LDAP_BASE]

            group.save(function(success){
              success.should.be.equal(false)
              this.errors.should.be.eql({ member: [ 'unknown member added' ] })
              next()
            })
          })
        })
      })


      it('remove a member from a group', function(next){
        store.ready(function(){
          var Group = store.Model('Group')
          Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member.length.should.be.equal(1)
            group.member = []

            group.save(function(success){
              success.should.be.equal(true)

              Group.find(group.dn).include('members').exec(function(group){
                group.members.length.should.be.equal(0)

                next()
              })
            })
          })
        })
      })

      it('returns an error on removing not existing members', function(next){
        store.ready(function(){
          var Group = store.Model('Group')
          Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member = []
            group.changes.member[0] = ['cn=not_existing,ou=update_test,ou=openrecord,' + LDAP_BASE]

            group.save(function(success){
              success.should.be.equal(false)
              this.errors.should.be.eql({ member: [ 'unknown member removed' ] })
              next()
            })
          })
        })
      })



      it('add members to a group via push', function(next){
        store.ready(function(){
          var Group = store.Model('Group')
          Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member.push(
              'cn=change_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE,
              'cn=change_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE
            )

            group.save(function(success){
              success.should.be.equal(true)

              Group.find(group.dn).include('members').exec(function(group){
                group.members.length.should.be.equal(2)
                next()
              })
            })
          })
        })
      })


      it('add and remove members to a group via splice', function(next){
        store.ready(function(){
          var Group = store.Model('Group')

          Group.find('cn=change_me_group,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(group){
            group.member.splice(0, 1, 'cn=disable_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE)

            group.save(function(success){
              success.should.be.equal(true)

              Group.find(group.dn).include('members').exec(function(group){
                group.members.length.should.be.equal(2)
                group.members[0].name.should.be.equal('disable_me_user')
                group.members[1].name.should.be.equal('change_me_user')
                next()
              })
            })
          })
        })
      })
    })






    describe('Computer', function(){
      it('returns an error on invalid move', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer')
          Computer.find('cn=move_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            computer.parent_dn = 'ou=somewhere,' + LDAP_BASE

            computer.save(function(success){
              success.should.be.equal(false)
              computer.errors.should.be.eql({ parent_dn: [ 'not valid' ] })
              next()
            })
          })
        })
      })


      it('returns an error on invalid name', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer')
          Computer.find('cn=rename_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            computer.name = 'cn=foooo'

            computer.save(function(success){
              success.should.be.equal(false)
              computer.errors.should.be.eql({ name: [ 'not valid' ] })
              next()
            })
          })
        })
      })


      it('moves an computer to another parent', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer')
          Computer.find('cn=move_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            computer.parent_dn = targetOu

            computer.save(function(success){
              success.should.be.equal(true)

              Computer.find(computer.dn).exec(function(computer){
                computer.name.should.be.equal('move_me_computer')
                computer.parent_dn.should.be.equal(targetOu)

                next()
              })
            })
          })
        })
      })


      it('renames a computer', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer')
          Computer.find('cn=rename_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            computer.name = 'new_computer_name'

            computer.save(function(success){
              success.should.be.equal(true)

              Computer.find(computer.dn).exec(function(computer){
                computer.name.should.be.equal('new_computer_name')
                computer.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase())

                next()
              })
            })
          })
        })
      })


      it('changes a computer', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer')
          Computer.find('cn=change_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            computer.sAMAccountName = 'supercomputer'
            computer.description = 'super very important'

            computer.save(function(success){
              success.should.be.equal(true)

              Computer.find(computer.dn).exec(function(computer){
                computer.description.should.be.equal('super very important')
                computer.sAMAccountName.should.be.equal('supercomputer$')

                next()
              })
            })
          })
        })
      })


      it('enable and disables a computer', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer')
          Computer.find('cn=disable_me_computer,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(computer){
            computer.userAccountControl.ACCOUNTDISABLED.should.be.equal(true)
            computer.userAccountControl = {ACCOUNTDISABLED: false, PASSWD_NOTREQUIRED: true, WORKSTATION_TRUST_ACCOUNT: true}

            computer.save(function(success){
              success.should.be.equal(true)

              Computer.find(computer.dn).exec(function(computer){
                computer.userAccountControl.ACCOUNTDISABLED.should.be.equal(false)
                computer.userAccountControl.ACCOUNTDISABLED = true

                computer.save(function(success){
                  success.should.be.equal(true)

                  Computer.find(computer.dn).exec(function(computer){
                    computer.userAccountControl.ACCOUNTDISABLED.should.be.equal(true)
                    next()
                  })
                })
              })
            })
          })
        })
      })
    })






    describe('User', function(){
      it('returns an error on invalid move', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.find('cn=move_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.parent_dn = 'ou=somewhere,' + LDAP_BASE

            user.save(function(success){
              success.should.be.equal(false)
              user.errors.should.be.eql({ parent_dn: [ 'not valid' ] })
              next()
            })
          })
        })
      })


      it('returns an error on invalid name', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.find('cn=rename_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.name = 'cn=fooooo'

            user.save(function(success){
              success.should.be.equal(false)
              user.errors.should.be.eql({ name: [ 'not valid' ] })
              next()
            })
          })
        })
      })



      it('moves an user to another parent', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.find('cn=move_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.parent_dn = targetOu

            user.save(function(success){
              success.should.be.equal(true)

              User.find(user.dn).exec(function(user){
                user.name.should.be.equal('move_me_user')
                user.parent_dn.should.be.equal(targetOu)

                next()
              })
            })
          })
        })
      })


      it('renames a user', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.find('cn=rename_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.name = 'new_user_name'

            user.save(function(success){
              success.should.be.equal(true)

              User.find(user.dn).exec(function(user){
                user.name.should.be.equal('new_user_name')
                user.parent_dn.should.be.equal('ou=update_test,ou=openrecord,' + LDAP_BASE.toLowerCase())

                next()
              })
            })
          })
        })
      })



      it('changes a user', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.find('cn=change_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.sAMAccountName = 'phils_account'
            user.description = 'uber important'
            user.givenName = 'Phil'
            user.sn = 'Waldmann'
            user.userPrincipalName = 'phils_account_long'
            user.mail = 'phil@mail.com'

            user.save(function(success){
              success.should.be.equal(true)

              User.find(user.dn).exec(function(user){
                user.description.should.be.equal('uber important')
                user.sAMAccountName.should.be.equal('phils_account')
                user.givenName.should.be.equal('Phil')
                user.sn.should.be.equal('Waldmann')
                user.userPrincipalName.should.be.equal('phils_account_long')
                user.mail.should.be.equal('phil@mail.com')

                next()
              })
            })
          })
        })
      })


      it('resets a user\'s password', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.find('cn=reset_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.unicodePwd = 'super5e(reT!'
            user.userAccountControl = {NORMAL_ACCOUNT: true} // by default all dummy users are disabled

            user.save(function(success){
              success.should.be.equal(true)

              user.checkPassword('super5e(reT!', function(okay){
                okay.should.be.equal(true)
                next()
              })
            })
          })
        })
      })


      it('resets a user\'s password with password expiration', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.find('cn=reset_me_user2,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.unicodePwd = 'super5e(reT2!'
            user.userAccountControl = {NORMAL_ACCOUNT: true} // by default all dummy users are disabled

            user.save(function(success){
              success.should.be.equal(true)

              user.unicodePwd = 'super5e(reT3!'
              user.userAccountControl.PASSWORD_EXPIRED = true
              user.pwdLastSet = 0

              user.save(function(success){
                success.should.be.equal(true)

                user.checkPassword('super5e(reT3!', function(okay){
                  okay.should.be.equal(false)
                  user.errors.should.be.eql({base: ['user must reset password']})
                  next()
                })
              })
            })
          })
        })
      })



      it('disables a user', function(next){
        store.ready(function(){
          var User = store.Model('User')
          User.find('cn=disable_me_user,ou=update_test,ou=openrecord,' + LDAP_BASE).exec(function(user){
            user.unicodePwd = 'super5e(reT5!'
            user.userAccountControl = {NORMAL_ACCOUNT: true, ACCOUNTDISABLED: true} // by default all dummy users are disabled

            user.save(function(success){
              success.should.be.equal(true)

              user.checkPassword('super5e(reT5!', function(okay){
                okay.should.be.equal(false)
                user.errors.should.be.eql({base: ['account disabled']})
                next()
              })
            })
          })
        })
      })
    })
  })
}
