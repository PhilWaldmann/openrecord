var should = require('should');

var Store = require('../../../lib/store');



describe('validatesFormatOf()', function(){
  var store = new Store();

  store.Model('User', function(){
    this.attribute('mail', String);
    this.validatesFormatOf('mail', 'email');
  });

  var User, valid, invalid;
  before(function(next){
    store.ready(function(){

      User = store.Model('User');
      valid = new User({mail:'philipp@email.com'});
      invalid = new User({mail:'not.a.valid@email!'});

      next();
    });
  });



  it('returns true on valid records', function(done){
    valid.isValid(function(valid){
      valid.should.be.true;
      done();
    });
  });

  it('returns false on invalid records', function(done){
    invalid.isValid(function(valid){
      valid.should.be.false;
      done();
    });
  });

  it('returns the right error message', function(done){
    invalid.isValid(function(valid){
      invalid.errors.should.have.property('mail');
      done();
    });
  });

  'url', 'ip', 'uuid', 'date', null, /test.*/

  describe('with multiple params', function(){

    var store = new Store();

    store.Model('User', function(){
      this.attribute('email', String);
      this.attribute('login', String);
      this.attribute('user_url', String);
      this.attribute('user_ip', String);
      this.attribute('user_uuid', String);
      this.attribute('created_at', String);
      this.attribute('blocked_at', String);
      this.attribute('first_name', String);

      this.validatesFormatOf(['email', 'login'], 'email');
      this.validatesFormatOf('user_url', 'url');
      this.validatesFormatOf('user_ip', 'ip');
      this.validatesFormatOf('user_uuid', 'uuid');
      this.validatesFormatOf('created_at', 'date');
      this.validatesFormatOf('blocked_at', null);
      this.validatesFormatOf('first_name', '(P|p)hil.*');
    });

    var User, valid, invalid;
    before(function(next){
      store.ready(function(){

        User = store.Model('User');
        valid = new User({
          email:'philipp@email.com',
          login:'philipp@email.com',
          user_url: 'http://www.s-team.at',
          user_ip:'10.20.30.40',
          user_uuid:'550e8400-e29b-41d4-a716-446655440000',
          created_at: new Date(),
          blocked_at: null,
          first_name: 'Philipp'
        });
        invalid = new User({
          email:'not.a.valid@email!',
          login: 'phil',
          user_url: 'http:www.s-team.at',
          user_ip:'10.620.30.40',
          user_uuid:'550e8400-ZZZZ-41d4-a716-446655440000',
          created_at: 'tomorrow',
          blocked_at: '2014-02-01',
          first_name: 'Alex'
        });

        next();
      });
    });



    it('returns true on valid records', function(done){
      valid.isValid(function(valid){
        valid.should.be.true;
        done();
      });
    });

    it('returns false on invalid records', function(done){
      invalid.isValid(function(valid){
        valid.should.be.false;
        done();
      });
    });

    it('returns the right error message', function(done){
      invalid.isValid(function(valid){
        invalid.errors.should.have.property('email');
        invalid.errors.should.have.property('user_url');
        invalid.errors.should.have.property('user_ip');
        invalid.errors.should.have.property('user_uuid');
        invalid.errors.should.have.property('created_at');
        invalid.errors.should.have.property('blocked_at');
        invalid.errors.should.have.property('first_name');
        done();
      });
    });

  });

});
