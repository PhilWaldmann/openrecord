var should = require('should');
var Store = require('../../../../lib/store');

module.exports = function(title, beforeFn, afterFn, store_conf){

  describe(title + ': Create (' + store_conf.url + ')', function(){
    var store;

    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });


    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
    });


    describe('OU', function(){
      it('creates a new ou', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit');
          var ou = Ou.new({
            name: 'new_ou',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          });

          ou.save(function(success){
            success.should.be.equal(true);

            Ou.find(ou.dn).exec(function(new_ou){

              new_ou.name.should.be.equal('new_ou');
              new_ou.ou.should.be.equal('new_ou');
              new_ou.objectGUID.length.should.be.equal(36);
              new_ou.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
              new_ou.objectClass.should.be.eql(["top","organizationalUnit"]);

              next();
            });
          });
        });
      });


      it('creates a new ou with upper case letters', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit');
          var ou = Ou.new({
            name: 'AwEsOmE_Ou',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          });

          ou.save(function(success){
            success.should.be.equal(true);

            Ou.find(ou.dn).exec(function(new_ou){

              new_ou.name.should.be.equal('AwEsOmE_Ou');
              new_ou.ou.should.be.equal('AwEsOmE_Ou');
              new_ou.objectGUID.length.should.be.equal(36);
              new_ou.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
              new_ou.objectClass.should.be.eql(["top","organizationalUnit"]);

              next();
            });
          });
        });
      });


      it('creates a new ou with all attributes', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit');
          var ou = Ou.new({
            name: 'all_attribute_ou',
            description: 'Description with utf-8 chars öäü',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          });

          ou.save(function(success){
            success.should.be.equal(true);

            Ou.find(ou.dn).exec(function(new_ou){

              new_ou.name.should.be.equal('all_attribute_ou');
              new_ou.description.should.be.equal('Description with utf-8 chars öäü');
              new_ou.ou.should.be.equal('all_attribute_ou');
              new_ou.objectGUID.length.should.be.equal(36);
              new_ou.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
              new_ou.objectClass.should.be.eql(["top","organizationalUnit"]);

              next();
            });
          });
        });
      });


      it('creates nested ous', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit');

          var child_ou = Ou.new({
            name: 'sub_nested_ou'
          });

          var ou = Ou.new({
            name: 'nested_ou',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            children:[child_ou]
          });

          ou.save(function(success){
            success.should.be.equal(true);

            Ou.find(ou.dn).include('children').exec(function(new_ou){

              new_ou.name.should.be.equal('nested_ou');
              new_ou.children[0].name.should.be.equal('sub_nested_ou');
              new_ou.children[0].parent_dn.should.be.equal(new_ou.dn);

              next();
            });
          });
        });
      });



      it('creates reverse nested ous (bottom up)', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit');

          var ou = Ou.new({
            name: 'level5',
            parent: {
              name:'level4',
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
          });

          ou.save(function(success){

            success.should.be.equal(true);

            Ou.find('ou=level1_ou,ou=create_test,ou=openrecord,' + LDAP_BASE ).include('all_children').exec(function(new_ou){

              new_ou.name.should.be.equal('level1_ou');
              new_ou.all_children.length.should.be.equal(4);

              new_ou.all_children[0].name.should.be.equal('level2');
              new_ou.all_children[0].parent_dn.should.be.equal(new_ou.dn);

              new_ou.all_children[1].name.should.be.equal('level3');
              new_ou.all_children[1].parent_dn.should.be.equal(new_ou.all_children[0].dn);

              new_ou.all_children[2].name.should.be.equal('level4');
              new_ou.all_children[2].parent_dn.should.be.equal(new_ou.all_children[1].dn);

              new_ou.all_children[3].name.should.be.equal('level5');
              new_ou.all_children[3].parent_dn.should.be.equal(new_ou.all_children[2].dn);

              next();
            });
          });
        });
      });


      it('returns an error on missing ou name', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit');
          var ou = Ou.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          });

          ou.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ name: [ 'not valid' ] });
            next();
          });
        });
      });

      it('returns an error on missing parent_dn', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit');
          var ou = Ou.new({
            name: 'foo'
          });

          ou.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ dn: [ 'not valid' ] });
            next();
          });
        });
      });

      it('returns an error on empty ou record', function(next){
        store.ready(function(){
          var Ou = store.Model('OrganizationalUnit');
          var ou = Ou.new({});

          ou.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ name: [ 'not valid' ] });
            next();
          });
        });
      });
    });







    describe('Group', function(){

      it('creates a new group', function(next){
        store.ready(function(){
          var Group = store.Model('Group');
          var group = Group.new({
            name: 'new_group',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          });

          group.save(function(success){
            success.should.be.equal(true);

            Group.find(group.dn).exec(function(new_group){

              new_group.name.should.be.equal('new_group');
              new_group.cn.should.be.equal('new_group');
              new_group.objectGUID.length.should.be.equal(36);
              new_group.objectSid.length.should.be.above(43);
              new_group.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
              new_group.objectClass.should.be.eql(["top","group"]);

              next();
            });
          });
        });
      });


      it('creates a new group with all attributes', function(next){
        store.ready(function(){
          var Group = store.Model('Group');
          var group = Group.new({
            name: 'all_attribute_group',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            sAMAccountName: 'group_samaccountname',
            description: 'fooöäüß'
          });

          group.save(function(success){
            success.should.be.equal(true);

            Group.find(group.dn).exec(function(new_group){

              new_group.name.should.be.equal('all_attribute_group');
              new_group.sAMAccountName.should.be.equal('group_samaccountname');
              new_group.description.should.be.equal('fooöäüß');
              new_group.groupType.should.be.eql({
                BUILTIN_LOCAL_GROUP:false,
                ACCOUNT_GROUP:true,
                RESOURCE_GROUP:false,
                UNIVERSAL_GROUP:false,
                APP_BASIC_GROUP:false,
                APP_QUERY_GROUP:false,
                SECURITY_ENABLED:true
              });

              next();
            });
          });
        });
      });


      it('creates a new none security universal group', function(next){
        store.ready(function(){
          var Group = store.Model('Group');
          var group = Group.new({
            name: 'security_group',
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            groupType: {SECURITY_ENABLED: false, UNIVERSAL_GROUP: true}
          });

          group.save(function(success){
            success.should.be.equal(true);

            Group.find(group.dn).exec(function(new_group){
              new_group.groupType.should.be.eql({
                BUILTIN_LOCAL_GROUP:false,
                ACCOUNT_GROUP:false,
                RESOURCE_GROUP:false,
                UNIVERSAL_GROUP:true,
                APP_BASIC_GROUP:false,
                APP_QUERY_GROUP:false,
                SECURITY_ENABLED:false
              });
              next();
            });
          });
        });
      });


      it('creates a new group with a new user', function(next){
        store.ready(function(){
          var Group = store.Model('Group');
          var User = store.Model('User');

          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'group_member'
          });

          var group = Group.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'membergroup',
            members:[user]
          });

          group.save(function(success){
            success.should.be.equal(true);

            Group.find(group.dn).include('members').exec(function(new_group){
              new_group.name.should.be.equal('membergroup');
              new_group.members.length.should.be.equal(1);
              new_group.members[0].name.should.be.equal('group_member');
              next();
            });
          });
        });
      });



      it('returns an error on missing group name', function(next){
        store.ready(function(){
          var Group = store.Model('Group');
          var group = Group.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          });

          group.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ name: [ 'not valid' ] });
            next();
          });
        });
      });

      it('returns an error on missing parent_dn', function(next){
        store.ready(function(){
          var Group = store.Model('OrganizationalUnit');
          var group = Group.new({
            name: 'foo'
          });

          group.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ dn: [ 'not valid' ] });
            next();
          });
        });
      });

      it('returns an error on empty group record', function(next){
        store.ready(function(){
          var Group = store.Model('Group');
          var group = Group.new({});

          group.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ name: [ 'not valid' ] });
            next();
          });
        });
      });

    });





    describe('Computer', function(){

      it('creates a new computer', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer');
          var computer = Computer.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'new_computer',
          });

          computer.save(function(success){
            Computer.find(computer.dn).exec(function(new_computer){
              new_computer.name.should.be.equal('new_computer');
              new_computer.cn.should.be.equal('new_computer');
              new_computer.sAMAccountName.should.be.equal('new_computer$');
              new_computer.objectGUID.length.should.be.equal(36);
              new_computer.objectSid.length.should.be.above(42);
              new_computer.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
              new_computer.objectClass.should.be.eql(["top","person","organizationalPerson","user","computer"]);

              next();
            });
          });
        });
      });


      it('creates a new computer with all attributes', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer');
          var computer = Computer.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'all_attribute_computer',
            sAMAccountName: 'openrecord_cp1',
            description: 'öäüß!'
          });

          computer.save(function(success){
            Computer.find(computer.dn).exec(function(new_computer){
              new_computer.name.should.be.equal('all_attribute_computer');
              new_computer.cn.should.be.equal('all_attribute_computer');
              new_computer.sAMAccountName.should.be.equal('openrecord_cp1$');
              new_computer.description.should.be.equal('öäüß!');
              new_computer.userAccountControl.should.be.eql({SCRIPT:false,ACCOUNTDISABLED:false,HOMEDIR_REQUIRED:false,LOCKOUT:false,PASSWD_NOTREQUIRED:true,PASSWD_CANT_CHANGE:false,ENCRYPTED_TEXT_PWD_ALLOWED:false,TEMP_DUPLICATE_ACCOUNT:false,NORMAL_ACCOUNT:false,INTERDOMAIN_TRUST_ACCOUNT:false,WORKSTATION_TRUST_ACCOUNT:true,SERVER_TRUST_ACCOUNT:false,DONT_EXPIRE_PASSWORD:false,MNS_LOGON_ACCOUNT:false,SMARTCARD_REQUIRED:false,TRUSTED_FOR_DELEGATION:false,NOT_DELEGATED:false,USE_DES_KEY_ONLY:false,DONT_REQ_PREAUTH:false,PASSWORD_EXPIRED:false,TRUSTED_TO_AUTH_FOR_DELEGATION:false,PARTIAL_SECRETS_ACCOUNT:false});
              new_computer.objectGUID.length.should.be.equal(36);
              new_computer.objectSid.length.should.be.above(42);
              new_computer.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
              new_computer.objectClass.should.be.eql(["top","person","organizationalPerson","user","computer"]);

              next();
            });
          });
        });
      });


      it('returns an error on missing computer name', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer');
          var computer = Computer.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          });

          computer.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ name: [ 'not valid' ] });
            next();
          });
        });
      });

      it('returns an error on missing parent_dn', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer');
          var computer = Computer.new({
            name: 'foo'
          });

          computer.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ dn: [ 'not valid' ] });
            next();
          });
        });
      });

      it('returns an error on empty computer record', function(next){
        store.ready(function(){
          var Computer = store.Model('Computer');
          var computer = Computer.new({});

          computer.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ name: [ 'not valid' ] });
            next();
          });
        });
      });
    });








    describe('User', function(){

      it('creates a new user', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'new_user',
          });

          user.save(function(success){
            User.find(user.dn).exec(function(new_user){
              new_user.name.should.be.equal('new_user');
              new_user.cn.should.be.equal('new_user');
              new_user.sAMAccountName.should.be.equal('new_user');
              new_user.objectGUID.length.should.be.equal(36);
              new_user.objectSid.length.should.be.above(42);
              new_user.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
              new_user.objectClass.should.be.eql(["top","person","organizationalPerson","user"]);

              next();
            });
          });
        });
      });


      it('creates a new user with all attributes', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'all_attribute_user',
            sAMAccountName: 'openrecord_user1',
            description: 'öäüß!'
          });

          user.save(function(success){
            User.find(user.dn).exec(function(new_user){
              new_user.name.should.be.equal('all_attribute_user');
              new_user.cn.should.be.equal('all_attribute_user');
              new_user.sAMAccountName.should.be.equal('openrecord_user1');
              new_user.description.should.be.equal('öäüß!');
              new_user.userAccountControl.should.be.eql({SCRIPT:false,ACCOUNTDISABLED:true,HOMEDIR_REQUIRED:false,LOCKOUT:false,PASSWD_NOTREQUIRED:false,PASSWD_CANT_CHANGE:false,ENCRYPTED_TEXT_PWD_ALLOWED:false,TEMP_DUPLICATE_ACCOUNT:false,NORMAL_ACCOUNT:true,INTERDOMAIN_TRUST_ACCOUNT:false,WORKSTATION_TRUST_ACCOUNT:false,SERVER_TRUST_ACCOUNT:false,DONT_EXPIRE_PASSWORD:false,MNS_LOGON_ACCOUNT:false,SMARTCARD_REQUIRED:false,TRUSTED_FOR_DELEGATION:false,NOT_DELEGATED:false,USE_DES_KEY_ONLY:false,DONT_REQ_PREAUTH:false,PASSWORD_EXPIRED:false,TRUSTED_TO_AUTH_FOR_DELEGATION:false,PARTIAL_SECRETS_ACCOUNT:false});
              new_user.objectGUID.length.should.be.equal(36);
              new_user.objectSid.length.should.be.above(42);
              new_user.parent_dn.should.be.equal('ou=create_test,ou=openrecord,' + LDAP_BASE.toLowerCase());
              new_user.objectClass.should.be.eql(["top","person","organizationalPerson","user"]);

              next();
            });
          });
        });
      });


      it('creates a new user with a password', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'active_user',
            unicodePwd: 'my!Sup0rSe(ret'
          });

          user.save(function(success){
            User.find(user.dn).exec(function(new_user){
              new_user.name.should.be.equal('active_user');
              new_user.userAccountControl.should.be.eql({SCRIPT:false,ACCOUNTDISABLED:false,HOMEDIR_REQUIRED:false,LOCKOUT:false,PASSWD_NOTREQUIRED:false,PASSWD_CANT_CHANGE:false,ENCRYPTED_TEXT_PWD_ALLOWED:false,TEMP_DUPLICATE_ACCOUNT:false,NORMAL_ACCOUNT:true,INTERDOMAIN_TRUST_ACCOUNT:false,WORKSTATION_TRUST_ACCOUNT:false,SERVER_TRUST_ACCOUNT:false,DONT_EXPIRE_PASSWORD:false,MNS_LOGON_ACCOUNT:false,SMARTCARD_REQUIRED:false,TRUSTED_FOR_DELEGATION:false,NOT_DELEGATED:false,USE_DES_KEY_ONLY:false,DONT_REQ_PREAUTH:false,PASSWORD_EXPIRED:false,TRUSTED_TO_AUTH_FOR_DELEGATION:false,PARTIAL_SECRETS_ACCOUNT:false});
              new_user.checkPassword('my!Sup0rSe(ret', function(success){
                success.should.be.equal(true);
                next();
              });

            });
          });
        });
      });


      it('creates a new user with a new group', function(next){
        store.ready(function(){
          var User = store.Model('User');

          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'group_user'
          });

          user.groups.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'usergroup'
          })

          user.save(function(success){
            success.should.be.equal(true);

            User.find(user.dn).include('groups').exec(function(new_user){
              new_user.name.should.be.equal('group_user');
              new_user.groups.length.should.be.equal(1);
              new_user.groups[0].name.should.be.equal('usergroup');
              next();
            });
          });
        });
      });


      it('returns an error on missing user name', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE
          });

          user.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ name: [ 'not valid' ] });
            next();
          });
        });
      });

      it('returns an error on missing parent_dn', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var user = User.new({
            name: 'foo'
          });

          user.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ dn: [ 'not valid' ] });
            next();
          });
        });
      });

      it('returns an error on empty user record', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var user = User.new({});

          user.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ name: [ 'not valid' ] });
            next();
          });
        });
      });

      it('returns an error on long user name', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
          });

          user.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ sAMAccountName: [ 'maximum length of 20 exceeded' ] });
            next();
          });
        });
      });


      it('returns an error on weak passwords', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'weak_user',
            unicodePwd: 'weak'
          });

          user.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ unicodePwd: [ 'must meet complexity requirements' ] });
            next();
          });
        });
      });


      it('returns an error on same usersname as password', function(next){
        store.ready(function(){
          var User = store.Model('User');
          var user = User.new({
            parent_dn: 'ou=create_test,ou=openrecord,' + LDAP_BASE,
            name: 'aWeS0m3_User',
            unicodePwd: 'aWeS0m3_User'
          });

          user.save(function(success){
            success.should.be.equal(false);
            this.errors.should.be.eql({ unicodePwd: [ 'must meet complexity requirements' ] });
            next();
          });
        });
      });
    });

  });
};
