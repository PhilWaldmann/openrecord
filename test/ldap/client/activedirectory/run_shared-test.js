require('./__helper')

testActiveDirectory('create', [
  // LDAP BASE will be added automatically! (global.LDAP_BASE)
  {
    dn: 'ou=openrecord',
    name: 'openrecord',
    objectClass: ['top', 'organizationalUnit'],
    children: [
      {
        dn: 'ou=create_test',
        name: 'create_test',
        objectClass: ['top', 'organizationalUnit'],
        children: [
          {
            dn: 'ou=sub_ou1',
            name: 'sub ou1',
            objectClass: ['top', 'organizationalUnit']
          }
        ]
      }
    ]
  }
])

testActiveDirectory('destroy', [
  // LDAP BASE will be added automatically! (global.LDAP_BASE)
  {
    dn: 'ou=openrecord',
    name: 'openrecord',
    objectClass: ['top', 'organizationalUnit'],
    children: [
      {
        dn: 'ou=destroy_test',
        name: 'destroy_test',
        objectClass: ['top', 'organizationalUnit'],
        children: [
          {
            dn: 'cn=destroy_me_user',
            name: 'destroy_me_user',
            objectClass: ['top', 'person', 'organizationalPerson', 'user']
          },
          {
            dn: 'cn=destroy_me_group',
            name: 'destroy_me_group',
            objectClass: ['top', 'group']
          },
          {
            dn: 'cn=destroy_me_computer',
            name: 'destroy_me_computer',
            objectClass: [
              'top',
              'person',
              'organizationalPerson',
              'user',
              'computer'
            ]
          },
          {
            dn: 'ou=destroy_me_ou',
            name: 'destroy_me_ou',
            objectClass: ['top', 'organizationalUnit']
          },

          {
            dn: 'ou=destroy_me_sub_ou',
            name: 'destroy_me_sub_ou',
            objectClass: ['top', 'organizationalUnit'],
            children: [
              {
                dn: 'ou=level1',
                name: 'level1',
                objectClass: ['top', 'organizationalUnit'],
                children: [
                  {
                    dn: 'ou=level2',
                    name: 'level2',
                    objectClass: ['top', 'organizationalUnit']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
])

testActiveDirectory('exec', [
  // LDAP BASE will be added automatically! (global.LDAP_BASE)
  {
    dn: 'ou=openrecord',
    name: 'openrecord',
    objectClass: ['top', 'organizationalUnit'],
    children: [
      {
        dn: 'ou=exec_test',
        name: 'exec_test',
        objectClass: ['top', 'organizationalUnit'],
        children: [
          {
            dn: 'ou=sub_ou1',
            name: 'sub ou1',
            objectClass: ['top', 'organizationalUnit'],
            children: [
              {
                dn: 'cn=openerecord_test_user1',
                name: 'Test User 1',
                objectClass: ['top', 'person', 'organizationalPerson', 'user']
              }, //, sAMAccountName:'openrecord_test_user1', sn:'User1', givenName:'Test', userAccountControl: 544, unicodePwd: convertPassword('my!Sup3rSecret')
              {
                dn: 'cn=openerecord_test_user2',
                name: 'Test User 2',
                objectClass: ['top', 'person', 'organizationalPerson', 'user']
              },
              {
                dn: 'cn=openerecord_test_user3',
                name: 'Test User 3',
                objectClass: ['top', 'person', 'organizationalPerson', 'user']
              }
            ]
          },
          {
            dn: 'ou=sub_ou2',
            name: 'sub ou2',
            objectClass: ['top', 'organizationalUnit'],
            children: [
              {
                dn: 'cn=openerecord_test_user4',
                name: 'Test User 4',
                objectClass: ['top', 'person', 'organizationalPerson', 'user']
              },
              {
                dn: 'cn=openerecord_test_user5',
                name: 'Test User 5',
                objectClass: ['top', 'person', 'organizationalPerson', 'user']
              }
            ]
          },
          {
            dn: 'ou=sub_ou3',
            name: 'sub ou3',
            objectClass: ['top', 'organizationalUnit'],
            children: [
              {
                dn: 'cn=openerecord_test_user6',
                name: 'Test User 6',
                objectClass: ['top', 'person', 'organizationalPerson', 'user'],
                givenName: 'first name',
                sn: 'last name',
                sAMAccountName: 'test_samaccountname'
              }
            ]
          },
          {
            dn: 'ou=sub_ou4',
            name: 'sub ou4',
            objectClass: ['top', 'organizationalUnit'],
            children: []
          }
        ]
      }
    ]
  }
])

testActiveDirectory('include', [
  // LDAP BASE will be added automatically! (global.LDAP_BASE)
  {
    dn: 'ou=openrecord',
    name: 'openrecord',
    objectClass: ['top', 'organizationalUnit'],
    children: [
      {
        dn: 'ou=include_test',
        name: 'include_test',
        objectClass: ['top', 'organizationalUnit'],
        children: [
          {
            dn: 'ou=sub_ou1',
            name: 'sub ou1',
            objectClass: ['top', 'organizationalUnit'],
            children: [
              {
                dn: 'cn=openerecord_test_user1',
                name: 'Test User 1',
                objectClass: ['top', 'person', 'organizationalPerson', 'user']
              },
              {
                dn: 'cn=openerecord_test_user2',
                name: 'Test User 2',
                objectClass: ['top', 'person', 'organizationalPerson', 'user']
              },
              {
                dn: 'cn=openerecord_test_user3',
                name: 'Test User 3',
                objectClass: ['top', 'person', 'organizationalPerson', 'user']
              }
            ]
          },
          {
            dn: 'ou=sub_ou2',
            name: 'sub ou2',
            objectClass: ['top', 'organizationalUnit'],
            children: [
              {
                dn: 'cn=openerecord_test_user4',
                name: 'Test User 4',
                objectClass: ['top', 'person', 'organizationalPerson', 'user']
              },
              {
                dn: 'cn=openerecord_test_user5',
                name: 'Test User 5',
                objectClass: ['top', 'person', 'organizationalPerson', 'user']
              }
            ]
          },
          {
            dn: 'ou=sub_ou3',
            name: 'sub ou3',
            objectClass: ['top', 'organizationalUnit'],
            children: [
              {
                dn: 'cn=openerecord_test_user6',
                name: 'Test User 6',
                objectClass: ['top', 'person', 'organizationalPerson', 'user'],
                givenName: 'first name',
                sn: 'last name',
                sAMAccountName: 'test_samaccountname'
              }
            ]
          },
          {
            dn: 'ou=sub_ou4',
            name: 'sub ou4',
            objectClass: ['top', 'organizationalUnit'],
            children: []
          }
        ]
      }
    ]
  }
])

testActiveDirectory('update', [
  // LDAP BASE will be added automatically! (global.LDAP_BASE)
  {
    dn: 'ou=openrecord',
    name: 'openrecord',
    objectClass: ['top', 'organizationalUnit'],
    children: [
      {
        dn: 'ou=update_test',
        name: 'include_test',
        objectClass: ['top', 'organizationalUnit'],
        children: [
          {
            dn: 'ou=move_target',
            name: 'target',
            objectClass: ['top', 'organizationalUnit']
          },

          {
            dn: 'cn=move_me_user',
            name: 'move_me_user',
            objectClass: ['top', 'person', 'organizationalPerson', 'user']
          },
          {
            dn: 'cn=move_me_group',
            name: 'move_me_group',
            objectClass: ['top', 'group']
          },
          {
            dn: 'cn=move_me_computer',
            name: 'move_me_computer',
            objectClass: [
              'top',
              'person',
              'organizationalPerson',
              'user',
              'computer'
            ]
          },
          {
            dn: 'ou=move_me_ou',
            name: 'move_me_ou',
            objectClass: ['top', 'organizationalUnit']
          },
          {
            dn: 'ou=move_me_test_ou',
            name: 'move_me_ou',
            objectClass: ['top', 'organizationalUnit']
          },
          {
            dn: 'ou=move_and_rename_me_ou',
            name: 'move_me_ou',
            objectClass: ['top', 'organizationalUnit']
          },
          {
            dn: 'ou=move_and_rename_me2_ou',
            name: 'move_me_ou',
            objectClass: ['top', 'organizationalUnit']
          },

          {
            dn: 'cn=rename_me_user',
            name: 'rename_me_user',
            objectClass: ['top', 'person', 'organizationalPerson', 'user']
          },
          {
            dn: 'cn=rename_me_group',
            name: 'rename_me_group',
            objectClass: ['top', 'group']
          },
          {
            dn: 'cn=rename_me_computer',
            name: 'rename_me_computer',
            objectClass: [
              'top',
              'person',
              'organizationalPerson',
              'user',
              'computer'
            ]
          },
          {
            dn: 'ou=rename_me_ou',
            name: 'rename_me_ou',
            objectClass: ['top', 'organizationalUnit']
          },

          {
            dn: 'cn=change_me_user',
            name: 'change_me_user',
            objectClass: ['top', 'person', 'organizationalPerson', 'user']
          },
          {
            dn: 'cn=change_me_group',
            name: 'change_me_group',
            objectClass: ['top', 'group']
          },
          {
            dn: 'cn=change_me_computer',
            name: 'change_me_computer',
            objectClass: [
              'top',
              'person',
              'organizationalPerson',
              'user',
              'computer'
            ]
          },
          {
            dn: 'ou=change_me_ou',
            name: 'change_me_ou',
            objectClass: ['top', 'organizationalUnit']
          },

          {
            dn: 'cn=reset_me_user',
            name: 'reset_me_user',
            objectClass: ['top', 'person', 'organizationalPerson', 'user']
          },
          {
            dn: 'cn=reset_me_user2',
            name: 'reset_me_user2',
            objectClass: ['top', 'person', 'organizationalPerson', 'user']
          },

          {
            dn: 'cn=disable_me_user',
            name: 'disable_me_user',
            objectClass: ['top', 'person', 'organizationalPerson', 'user']
          },
          {
            dn: 'cn=disable_me_computer',
            name: 'disable_me_computer',
            objectClass: [
              'top',
              'person',
              'organizationalPerson',
              'user',
              'computer'
            ]
          }
        ]
      }
    ]
  }
])
