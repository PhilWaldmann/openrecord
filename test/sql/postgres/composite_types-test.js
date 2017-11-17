var Store = require('../../../store/postgres')


describe('Postgres: Composite Types', function(){
  var store
  var database = 'composite_type_test'



  before(function(next){
    this.timeout(5000)
    beforePG(database, [
      'DROP TYPE IF EXISTS customtype',
      'CREATE type customtype AS (foo integer, bar text)',
      'CREATE TABLE attribute_tests(id serial primary key, composite_attribute customtype)',
      "INSERT INTO attribute_tests (composite_attribute)VALUES(ROW(1,'foo'))"
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
      this.attributes.composite_attribute.use(function(){
        this.validatesPresenceOf('bar')
      })
    })

    store.on('exception', function(){})
  })

  after(function(next){
    afterPG(database, next)
  })




  it('has attribute definition', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      AttributeTest.definition.attributes.should.have.property('composite_attribute')

      done()
    })
  })


  it('attribute type is composite', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      AttributeTest.definition.attributes.composite_attribute.type.name.should.be.equal('composite')

      done()
    })
  })


  it('new record has all composite fields', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      var record = new AttributeTest({})

      record.toJson().should.be.eql({
        id: null,
        composite_attribute: {
          foo: null,
          bar: null
        }
      })

      done()
    })
  })


  it('composite fields are available after assignment', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      var record = new AttributeTest({})

      record.composite_attribute = {foo: 1}

      record.toJson().should.be.eql({
        id: null,
        composite_attribute: {
          foo: 1,
          bar: null
        }
      })

      done()
    })
  })


  it('uses composite field validations', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      var record = new AttributeTest({})

      record.composite_attribute.isValid(function(valid){
        valid.should.be.equal(false)
        done()
      })
    })
  })

  it('uses composite field validations on parent record', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      var record = new AttributeTest({})

      record.isValid(function(valid){
        valid.should.be.equal(false)
        this.errors.should.be.eql({ 'composite_attribute.bar': [ 'not valid' ] })
        done()
      })
    })
  })


  it('record with invalid composite field wont save', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      var record = new AttributeTest({})

      record.save(function(success){
        success.should.be.equal(false)
        this.errors.should.be.eql({ 'composite_attribute.bar': [ 'not valid' ] })
        done()
      })
    })
  })



  it('read composite type', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      AttributeTest.find(1).exec().then(function(record){
        record.toJson().should.be.eql({
          id: 1,
          composite_attribute: {
            foo: 1,
            bar: 'foo'
          }
        })

        done()
      })
    })
  })


  it('changes in composite field are recognised in record', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      AttributeTest.find(1).exec().then(function(record){
        record.composite_attribute.foo = 2

        record.hasChanges().should.be.equal(true)

        done()
      })
    })
  })


  it('no changes in composite field are recognised in record as well', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      AttributeTest.find(1).exec().then(function(record){
        record.hasChanges().should.be.equal(false)

        done()
      })
    })
  })


  it('saves changes in the composite field', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      AttributeTest.find(1).exec().then(function(record){
        record.composite_attribute.foo = 2

        record.save(function(success){
          success.should.be.equal(true)

          AttributeTest.find(1).exec().then(function(record){
            record.toJson().should.be.eql({
              id: 1,
              composite_attribute: {
                foo: 2,
                bar: 'foo'
              }
            })
            done()
          })
        })
      })
    })
  })


  it('changes only composite field changes - not the whole field', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      AttributeTest.find(1).exec().then(function(record){
        record.composite_attribute.foo = 2
        record.composite_attribute.bar = 'abc'

        delete record.composite_attribute.changes.bar // ignore change

        record.save(function(success){
          success.should.be.equal(true)

          AttributeTest.find(1).exec().then(function(record){
            record.toJson().should.be.eql({
              id: 1,
              composite_attribute: {
                foo: 2,
                bar: 'foo'
              }
            })
            done()
          })
        })
      })
    })
  })



  it('creates a new record', function(done){
    store.ready(function(){
      var AttributeTest = store.Model('AttributeTest')
      AttributeTest.create({
        composite_attribute: {
          bar: 'text'
        }
      }, function(success){
        success.should.be.equal(true)

        AttributeTest.find(2).exec().then(function(record){
          record.toJson().should.be.eql({
            id: 2,
            composite_attribute: {
              foo: null,
              bar: 'text'
            }
          })
          done()
        })
      })
    })
  })
})
