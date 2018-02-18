var Store = require('../../../../lib/store')

module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Create (' + storeConf.url + ')', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
      
    })


    describe('OU', function(){
      it('creates a new ou', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          var ou = Ou.new({
            name: 'newOu',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          })

          return ou.save(function(){
            return Ou.find(ou.dn).exec(function(newOu){
              newOu.name.should.be.equal('newOu')
              newOu.ou.should.be.equal('newOu')
              newOu.objectGUID.length.should.be.equal(36)
              newOu.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              newOu.objectClass.should.be.eql(['top', 'organizationalUnit'])
            })
          })
        })
      })


      it('creates a new ou with upper case letters', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          var ou = Ou.new({
            name: 'AwEsOmE_Ou',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          })

          return ou.save(function(){
            return Ou.find(ou.dn).exec(function(newOu){
              newOu.name.should.be.equal('AwEsOmE_Ou')
              newOu.ou.should.be.equal('AwEsOmE_Ou')
              newOu.objectGUID.length.should.be.equal(36)
              newOu.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              newOu.objectClass.should.be.eql(['top', 'organizationalUnit'])
            })
          })
        })
      })


      it('creates a new ou with all attributes', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          var ou = Ou.new({
            name: 'all_attribute_ou',
            description: 'Description with utf-8 chars öäü',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          })

          return ou.save(function(){
            return Ou.find(ou.dn).exec(function(newOu){
              newOu.name.should.be.equal('all_attribute_ou')
              newOu.description.should.be.equal('Description with utf-8 chars öäü')
              newOu.ou.should.be.equal('all_attribute_ou')
              newOu.objectGUID.length.should.be.equal(36)
              newOu.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              newOu.objectClass.should.be.eql(['top', 'organizationalUnit'])
            })
          })
        })
      })


      it('creates nested ous', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')

          var childOu = Ou.new({
            name: 'sub_nested_ou'
          })

          var ou = Ou.new({
            name: 'nested_ou',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            children: [childOu]
          })

          return ou.save(function(){
            return Ou.find(ou.dn).include('children').exec(function(newOu){
              newOu.name.should.be.equal('nested_ou')
              newOu.children[0].name.should.be.equal('sub_nested_ou')
              newOu.children[0].parent_dn.should.be.equal(newOu.dn)
            })
          })
        })
      })



      it('creates reverse nested ous (bottom up)', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')

          var ou = Ou.new({
            name: 'level5',
            parent: {
              name: 'level4',
              parent: {
                name: 'level3',
                parent: {
                  name: 'level2',
                  parent: {
                    name: 'level1_ou',
                    parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
                  }
                }
              }
            }
          })

          return ou.save(function(){
            return Ou.find('ou=level1_ou,ou=create_test,ou=openrecord,' + LDAP_BASE).include('all_children').exec(function(newOu){
              newOu.name.should.be.equal('level1_ou')
              newOu.all_children.length.should.be.equal(4)

              newOu.all_children[0].name.should.be.equal('level2')
              newOu.all_children[0].parent_dn.should.be.equal(newOu.dn)

              newOu.all_children[1].name.should.be.equal('level3')
              newOu.all_children[1].parent_dn.should.be.equal(newOu.all_children[0].dn)

              newOu.all_children[2].name.should.be.equal('level4')
              newOu.all_children[2].parent_dn.should.be.equal(newOu.all_children[1].dn)

              newOu.all_children[3].name.should.be.equal('level5')
              newOu.all_children[3].parent_dn.should.be.equal(newOu.all_children[2].dn)
            })
          })
        })
      })


      it('returns an error on missing ou name', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          var ou = Ou.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          })

          return ou.save()
        }).should.be.rejectedWith(store.ValidationError)
      })

      it('returns an error on missing parent_dn', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          var ou = Ou.new({
            name: 'foo'
          })

          return ou.save()
        }).should.be.rejectedWith(store.ValidationError)
      })

      it('returns an error on empty ou record', function(){
        return store.ready(function(){
          var Ou = store.Model('OrganizationalUnit')
          var ou = Ou.new({})

          return ou.save()
        }).should.be.rejectedWith(store.ValidationError)
      })
    })







    describe('Group', function(){
      it('creates a new group', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          var group = Group.new({
            name: 'newGroup',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          })

          return group.save(function(){
            return Group.find(group.dn).exec(function(newGroup){
              newGroup.name.should.be.equal('newGroup')
              newGroup.cn.should.be.equal('newGroup')
              newGroup.objectGUID.length.should.be.equal(36)
              newGroup.objectSid.length.should.be.above(43)
              newGroup.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              newGroup.objectClass.should.be.eql(['top', 'group'])
            })
          })
        })
      })


      it('creates a new group with all attributes', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          var group = Group.new({
            name: 'all_attribute_group',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            sAMAccountName: 'group_samaccountname',
            description: 'fooöäüß'
          })

          return group.save(function(){
            return Group.find(group.dn).exec(function(newGroup){
              newGroup.name.should.be.equal('all_attribute_group')
              newGroup.sAMAccountName.should.be.equal('group_samaccountname')
              newGroup.description.should.be.equal('fooöäüß')
              newGroup.groupType.should.be.eql({
                BUILTIN_LOCAL_GROUP: false,
                ACCOUNT_GROUP: true,
                RESOURCE_GROUP: false,
                UNIVERSAL_GROUP: false,
                APP_BASIC_GROUP: false,
                APP_QUERY_GROUP: false,
                SECURITY_ENABLED: true
              })
            })
          })
        })
      })


      it('creates a new none security universal group', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          var group = Group.new({
            name: 'security_group',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            groupType: {SECURITY_ENABLED: false, UNIVERSAL_GROUP: true}
          })

          return group.save(function(){
            return Group.find(group.dn).exec(function(newGroup){
              newGroup.groupType.should.be.eql({
                BUILTIN_LOCAL_GROUP: false,
                ACCOUNT_GROUP: false,
                RESOURCE_GROUP: false,
                UNIVERSAL_GROUP: true,
                APP_BASIC_GROUP: false,
                APP_QUERY_GROUP: false,
                SECURITY_ENABLED: false
              })
            })
          })
        })
      })


      it('creates a new group with a new user', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          var User = store.Model('User')

          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'group_member'
          })

          var group = Group.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'membergroup',
            members: [user]
          })

          return group.save(function(){
            return Group.find(group.dn).include('members').exec(function(newGroup){
              newGroup.name.should.be.equal('membergroup')
              newGroup.members.length.should.be.equal(1)
              newGroup.members[0].name.should.be.equal('group_member')
            })
          })
        })
      })



      it('returns an error on missing group name', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          var group = Group.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          })

          return group.save()
        }).should.be.rejectedWith(store.ValidationError)
      })

      it('returns an error on missing parent_dn', function(){
        return store.ready(function(){
          var Group = store.Model('OrganizationalUnit')
          var group = Group.new({
            name: 'foo'
          })

          return group.save()
        }).should.be.rejectedWith(store.ValidationError)
      })

      it('returns an error on empty group record', function(){
        return store.ready(function(){
          var Group = store.Model('Group')
          var group = Group.new({})

          return group.save()
        }).should.be.rejectedWith(store.ValidationError)
      })
    })





    describe('Computer', function(){
      it('creates a new computer', function(){
        return store.ready(function(){
          var Computer = store.Model('Computer')
          var computer = Computer.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'newComputer'
          })

          return computer.save(function(){
            return Computer.find(computer.dn).exec(function(newComputer){
              newComputer.name.should.be.equal('newComputer')
              newComputer.cn.should.be.equal('newComputer')
              newComputer.sAMAccountName.should.be.equal('newComputer$')
              newComputer.objectGUID.length.should.be.equal(36)
              newComputer.objectSid.length.should.be.above(42)
              newComputer.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              newComputer.objectClass.should.be.eql(['top', 'person', 'organizationalPerson', 'user', 'computer'])
            })
          })
        })
      })


      it('creates a new computer with all attributes', function(){
        return store.ready(function(){
          var Computer = store.Model('Computer')
          var computer = Computer.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'all_attribute_computer',
            sAMAccountName: 'openrecord_cp1',
            description: 'öäüß!'
          })

          return computer.save(function(){
            return Computer.find(computer.dn).exec(function(newComputer){
              newComputer.name.should.be.equal('all_attribute_computer')
              newComputer.cn.should.be.equal('all_attribute_computer')
              newComputer.sAMAccountName.should.be.equal('openrecord_cp1$')
              newComputer.description.should.be.equal('öäüß!')
              newComputer.userAccountControl.should.be.eql({SCRIPT: false, ACCOUNTDISABLED: false, HOMEDIR_REQUIRED: false, LOCKOUT: false, PASSWD_NOTREQUIRED: true, PASSWD_CANT_CHANGE: false, ENCRYPTED_TEXT_PWD_ALLOWED: false, TEMP_DUPLICATE_ACCOUNT: false, NORMAL_ACCOUNT: false, INTERDOMAIN_TRUST_ACCOUNT: false, WORKSTATION_TRUST_ACCOUNT: true, SERVER_TRUST_ACCOUNT: false, DONT_EXPIRE_PASSWORD: false, MNS_LOGON_ACCOUNT: false, SMARTCARD_REQUIRED: false, TRUSTED_FOR_DELEGATION: false, NOT_DELEGATED: false, USE_DES_KEY_ONLY: false, DONT_REQ_PREAUTH: false, PASSWORD_EXPIRED: false, TRUSTED_TO_AUTH_FOR_DELEGATION: false, PARTIAL_SECRETS_ACCOUNT: false})
              newComputer.objectGUID.length.should.be.equal(36)
              newComputer.objectSid.length.should.be.above(42)
              newComputer.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              newComputer.objectClass.should.be.eql(['top', 'person', 'organizationalPerson', 'user', 'computer'])
            })
          })
        })
      })


      it('returns an error on missing computer name', function(){
        return store.ready(function(){
          var Computer = store.Model('Computer')
          var computer = Computer.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          })

          return computer.save()
        }).should.be.rejectedWith(store.ValidationError)
      })

      it('returns an error on missing parent_dn', function(){
        return store.ready(function(){
          var Computer = store.Model('Computer')
          var computer = Computer.new({
            name: 'foo'
          })

          return computer.save()
        }).should.be.rejectedWith(store.ValidationError)
      })

      it('returns an error on empty computer record', function(){
        return store.ready(function(){
          var Computer = store.Model('Computer')
          var computer = Computer.new({})

          return computer.save()
        }).should.be.rejectedWith(store.ValidationError)
      })
    })








    describe('User', function(){
      it('creates a new user', function(){
        return store.ready(function(){
          var User = store.Model('User')
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'newUser'
          })

          return user.save(function(){
            return User.find(user.dn).exec(function(newUser){
              newUser.name.should.be.equal('newUser')
              newUser.cn.should.be.equal('newUser')
              newUser.sAMAccountName.should.be.equal('newUser')
              newUser.objectGUID.length.should.be.equal(36)
              newUser.objectSid.length.should.be.above(42)
              newUser.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              newUser.objectClass.should.be.eql(['top', 'person', 'organizationalPerson', 'user'])
            })
          })
        })
      })


      it('creates a new user with all attributes', function(){
        return store.ready(function(){
          var User = store.Model('User')
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'all_attribute_user',
            sAMAccountName: 'openrecord_user1',
            description: 'öäüß!'
          })

          return user.save(function(){
            return User.find(user.dn).exec(function(newUser){
              newUser.name.should.be.equal('all_attribute_user')
              newUser.cn.should.be.equal('all_attribute_user')
              newUser.sAMAccountName.should.be.equal('openrecord_user1')
              newUser.description.should.be.equal('öäüß!')
              newUser.userAccountControl.should.be.eql({SCRIPT: false, ACCOUNTDISABLED: true, HOMEDIR_REQUIRED: false, LOCKOUT: false, PASSWD_NOTREQUIRED: false, PASSWD_CANT_CHANGE: false, ENCRYPTED_TEXT_PWD_ALLOWED: false, TEMP_DUPLICATE_ACCOUNT: false, NORMAL_ACCOUNT: true, INTERDOMAIN_TRUST_ACCOUNT: false, WORKSTATION_TRUST_ACCOUNT: false, SERVER_TRUST_ACCOUNT: false, DONT_EXPIRE_PASSWORD: false, MNS_LOGON_ACCOUNT: false, SMARTCARD_REQUIRED: false, TRUSTED_FOR_DELEGATION: false, NOT_DELEGATED: false, USE_DES_KEY_ONLY: false, DONT_REQ_PREAUTH: false, PASSWORD_EXPIRED: false, TRUSTED_TO_AUTH_FOR_DELEGATION: false, PARTIAL_SECRETS_ACCOUNT: false})
              newUser.objectGUID.length.should.be.equal(36)
              newUser.objectSid.length.should.be.above(42)
              newUser.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase())
              newUser.objectClass.should.be.eql(['top', 'person', 'organizationalPerson', 'user'])
            })
          })
        })
      })


      it('creates a new user with a password', function(){
        return store.ready(function(){
          var User = store.Model('User')
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'active_user',
            unicodePwd: 'my!Sup0rSe(ret'
          })

          return user.save(function(){
            return User.find(user.dn).exec(function(newUser){
              newUser.name.should.be.equal('active_user')
              newUser.userAccountControl.should.be.eql({SCRIPT: false, ACCOUNTDISABLED: false, HOMEDIR_REQUIRED: false, LOCKOUT: false, PASSWD_NOTREQUIRED: false, PASSWD_CANT_CHANGE: false, ENCRYPTED_TEXT_PWD_ALLOWED: false, TEMP_DUPLICATE_ACCOUNT: false, NORMAL_ACCOUNT: true, INTERDOMAIN_TRUST_ACCOUNT: false, WORKSTATION_TRUST_ACCOUNT: false, SERVER_TRUST_ACCOUNT: false, DONT_EXPIRE_PASSWORD: false, MNS_LOGON_ACCOUNT: false, SMARTCARD_REQUIRED: false, TRUSTED_FOR_DELEGATION: false, NOT_DELEGATED: false, USE_DES_KEY_ONLY: false, DONT_REQ_PREAUTH: false, PASSWORD_EXPIRED: false, TRUSTED_TO_AUTH_FOR_DELEGATION: false, PARTIAL_SECRETS_ACCOUNT: false})
              return newUser.checkPassword('my!Sup0rSe(ret')
            })
          })
        })
      })


      it('creates a new user with a new group', function(){
        return store.ready(function(){
          var User = store.Model('User')

          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'group_user'
          })

          user.groups.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'usergroup'
          })

          return user.save(function(){
            return User.find(user.dn).include('groups').exec(function(newUser){
              newUser.name.should.be.equal('group_user')
              newUser.groups.length.should.be.equal(1)
              newUser.groups[0].name.should.be.equal('usergroup')
            })
          })
        })
      })


      it('returns an error on missing user name', function(){
        return store.ready(function(){
          var User = store.Model('User')
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          })

          return user.save()
        }).should.be.rejectedWith(store.ValidationError)
      })

      it('returns an error on missing parent_dn', function(){
        return store.ready(function(){
          var User = store.Model('User')
          var user = User.new({
            name: 'foo'
          })

          return user.save()
        }).should.be.rejectedWith(store.ValidationError)
      })

      it('returns an error on empty user record', function(){
        return store.ready(function(){
          var User = store.Model('User')
          var user = User.new({})

          return user.save()
        }).should.be.rejectedWith(store.ValidationError)
      })

      it('returns an error on long user name', function(){
        return store.ready(function(){
          var User = store.Model('User')
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
          })

          return user.save()
        }).should.be.rejectedWith(store.ValidationError)
      })


      it('returns an error on weak passwords', function(){
        return store.ready(function(){
          var User = store.Model('User')
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'weak_user',
            unicodePwd: 'weak'
          })

          return user.save()
        }).should.be.rejectedWith(store.ValidationError)
      })


      it('returns an error on same usersname as password', function(){
        return store.ready(function(){
          var User = store.Model('User')
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'aWeS0m3_User',
            unicodePwd: 'aWeS0m3_User'
          })

          return user.save()
        }).should.be.rejectedWith(store.ValidationError)
      })
    })
  })
}
