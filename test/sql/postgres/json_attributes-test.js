var should = require('should');
var Store = require('../../../lib/store');


describe('Postgres: Json/Jsonb Attributes', function(){
  var store;
  var database = 'json_attributes_test';



  before(function(next){
    this.timeout(5000);
    beforePG(database, [], next);
  });

  before(function(){
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: '',
      migrations: __dirname + '/fixtures/migrations/*'
    });

    store.Model('JsonTest', function(){});

    store.setMaxListeners(0);
    store.on('exception', function(){});
  });

  after(function(next){
    afterPG(database, next);
  });


  it('writes and ready json data', function(next){
    store.ready(function(){
      var JsonTest = store.Model('JsonTest');
      var test = new JsonTest({ json_attr: {foo: {bar: [1, 2, 3]}} })

      test.save(function (success) {
        success.should.be.equal(true)

        JsonTest.find(test.id).exec(function(t){
          t.json_attr.should.be.eql({foo: {bar: [1, 2, 3]}})
          next();
        })
      })
    });
  });

  it('writes and ready jsonb data', function(next){
    store.ready(function(){
      var JsonTest = store.Model('JsonTest');
      var test = new JsonTest({ jsonb_attr: {foo: {bar: [1, 2, 3]}} })

      test.save(function (success) {
        success.should.be.equal(true)

        JsonTest.find(test.id).exec(function(t){
          t.jsonb_attr.should.be.eql({foo: {bar: [1, 2, 3]}})
          next();
        })
      })
    });
  });

  it('updates json data', function(next){
    store.ready(function(){
      var JsonTest = store.Model('JsonTest');

      JsonTest.find(1).exec(function(test){
        test.json_attr.foo.bar.push(4);
        test.json_attr.bar = 'test';

        test.save(function(success){
          success.should.be.equal(true)

          JsonTest.find(test.id).exec(function(t){
            t.json_attr.should.be.eql({foo: {bar: [1, 2, 3, 4]}, bar: 'test'})
            next();
          })
        })
      })
    });
  });


  it('sort by json attribute', function(next){
    store.ready(function(){
      var JsonTest = store.Model('JsonTest');
      var test = new JsonTest({ json_attr: {bar: 'foo'} })

      test.save(function (success) {
        success.should.be.equal(true)

        JsonTest.order('json_attr.bar').exec(function(result){
          result[0].json_attr.bar.should.be.equal('foo')
          result[1].json_attr.bar.should.be.equal('test')
          should.not.exist(result[2].json_attr.bar)
          result.length.should.be.equal(3)
          next();
        })
      })
    });
  });


  it('condition with json attribute', function(next){
    store.ready(function(){
      var JsonTest = store.Model('JsonTest');

      JsonTest.where({json_attr: {bar: 'test'}}).exec(function(result){
        result[0].json_attr.bar.should.be.equal('test')
        result.length.should.be.equal(1)
        next();
      })
    });
  });

});
