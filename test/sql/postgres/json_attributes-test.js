var should = require('should')
var path = require('path')

var Store = require('../../../store/postgres')


describe('Postgres: Json/Jsonb Attributes', function(){
  var store
  var database = 'json_attributes_test'



  before(function(next){
    this.timeout(5000)
    beforePG(database, [], next)
  })

  before(function(){
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: '',
      migrations: path.join(__dirname, 'fixtures', 'migrations', '*'),
      plugins: require('../../../lib/base/dynamic_loading')
    })

    store.Model('JsonTest', function(){})
  })

  after(function(next){
    afterPG(database, next)
  })


  it('writes and ready json data', function(){
    return store.ready(function(){
      var JsonTest = store.Model('JsonTest')
      var test = new JsonTest({ json_attr: {foo: {bar: [1, 2, 3]}} })

      return test.save()
      .then(function() {
        return JsonTest.find(test.id).exec(function(t){
          t.json_attr.should.be.eql({foo: {bar: [1, 2, 3]}})
        })
      })
    })
  })

  it('writes and ready jsonb data', function(){
    return store.ready(function(){
      var JsonTest = store.Model('JsonTest')
      var test = new JsonTest({ jsonb_attr: {foo: {bar: [1, 2, 3]}} })

      return test.save()
      .then(function() {
        return JsonTest.find(test.id).exec(function(t){
          t.jsonb_attr.should.be.eql({foo: {bar: [1, 2, 3]}})
        })
      })
    })
  })

  it('updates json data', function(){
    return store.ready(function(){
      var JsonTest = store.Model('JsonTest')

      return JsonTest.find(1).exec(function(test){
        test.json_attr.foo.bar.push(4)
        test.json_attr.bar = 'test'

        return test.save()
        .then(function(){
          return JsonTest.find(test.id).exec(function(t){
            t.json_attr.should.be.eql({foo: {bar: [1, 2, 3, 4]}, bar: 'test'})
          })
        })
      })
    })
  })

  it('sort by json attribute', function(){
    return store.ready(function(){
      var JsonTest = store.Model('JsonTest')
      var test = new JsonTest({ json_attr: {bar: 'foo'} })

      return test.save()
      .then(function() {
        return JsonTest.order('json_attr.bar').exec(function(result){
          result[0].json_attr.bar.should.be.equal('foo')
          result[1].json_attr.bar.should.be.equal('test')
          should.not.exist(result[2].json_attr.bar)
          result.length.should.be.equal(3)
        })
      })
    })
  })


  it('condition with json attribute', function(){
    return store.ready(function(){
      var JsonTest = store.Model('JsonTest')

      return JsonTest.where({json_attr: {bar: 'test'}}).exec(function(result){
        result[0].json_attr.bar.should.be.equal('test')
        result.length.should.be.equal(1)
      })
    })
  })


  it('updates json data (root)', function(){
    return store.ready(function(){
      var JsonTest = store.Model('JsonTest')

      return JsonTest.find(1).exec(function(test){
        test.json_attr = [{a: 1, b: 2}, {b: 2}]

        return test.save()
        .then(function(){
          return JsonTest.find(test.id).exec(function(t){
            t.json_attr.should.be.eql([{a: 1, b: 2}, {b: 2}])
          })
        })
      })
    })
  })
})
