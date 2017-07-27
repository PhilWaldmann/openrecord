var Store = require('../../../lib/store')


describe('Postgres: ENUM Attribute', function(){
  var store
  var database = 'enum_attributes_test'



  before(function(next){
    this.timeout(5000)
    beforePG(database, [
      "CREATE type my_enum AS ENUM('foo', 'bar')",
      'CREATE TABLE attribute_tests(id serial primary key, enum_attribute my_enum)',
      "INSERT INTO attribute_tests (enum_attribute)VALUES('foo')"
    ], next)
  })

  before(function(){
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: ''
    })

    store.Model('AttributeTest', function(){
    })

    store.on('exception', function(){})
  })

  after(function(next){
    afterPG(database, next)
  })




  it('has enum_attribute', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')

      var attrs = AttributeTest.definition.attributes

      attrs.should.have.property('enum_attribute')

      done()
    })
  })


  it('enum_attribute is a string', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')

      var attrs = AttributeTest.definition.attributes

      attrs.enum_attribute.type.name.should.be.equal('string')

      done()
    })
  })


  it('does not allow to save any other value than defined in enum', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')

      AttributeTest.create({
        enum_attribute: 'unknown'
      }).then(function(success){
        success.should.be.equal(false)
        this.errors.should.be.eql({ enum_attribute: [ 'only allow one of [foo, bar]' ] })
        done()
      })
    })
  })

  it('saves valid enum value', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')

      AttributeTest.create({
        enum_attribute: 'foo'
      }).then(function(success){
        success.should.be.equal(true)
        done()
      })
    })
  })
})
