var Store = require('../../../lib/store')

if(process.env['ORACLE_HOME']){
  describe.only('Oracle: all Attributes', function(){
    var store
    var database = 'all_attributes_test'



    before(function(next){
      beforeOracle(database, [
        'CREATE TABLE "attribute_tests"("char_attribute"  VARCHAR2(255), "float_attribute" NUMBER(9,2), "integer_attribute" NUMBER, "text_attribute" VARCHAR2(255), "binary_attribute" BLOB, "date_attribute" DATE, "datetime_attribute" TIMESTAMP)',
        "INSERT INTO \"attribute_tests\" VALUES('abcd', 2.33, 3243, 'some text', utl_raw.cast_to_raw('some binary data'), TO_DATE('2014-02-18', 'yyyy-mm-dd'), TO_DATE('2014-02-18 15:45:02', 'yyyy-mm-dd hh24:mi:ss'))"
      ], next)
    })

    before(function(){
      store = new Store(getOracleConfig(database))

      store.Model('AttributeTest', function(){})

      store.on('exception', function(){})
    })

    after(function(next){
      afterOracle(database, next)
    })




    it('have all attributes loaded', function(done){
      store.ready(function(){
        var AttributeTest = store.Model('AttributeTest')

        var attrs = AttributeTest.definition.attributes

        attrs.should.have.property('char_attribute')
        attrs.should.have.property('float_attribute')
        attrs.should.have.property('integer_attribute')
        attrs.should.have.property('text_attribute')
        attrs.should.have.property('binary_attribute')
        attrs.should.have.property('date_attribute')
        attrs.should.have.property('datetime_attribute')

        done()
      })
    })


    it('casts all values', function(done){
      store.ready(function(){
        var AttributeTest = store.Model('AttributeTest')
        AttributeTest.limit(1).exec(function(record){
          record.char_attribute.should.be.equal('abcd')
          record.float_attribute.should.be.equal(2.33)
          record.integer_attribute.should.be.equal(3243)
          record.text_attribute.should.be.equal('some text')

          if(Buffer.from) record.binary_attribute.should.be.eql(Buffer.from('some binary data', 'utf-8'))
          else record.binary_attribute.should.be.eql(new Buffer('some binary data', 'utf-8')) // eslint-disable-line node/no-deprecated-api

          if(new Date().getTimezoneOffset() <= -60){ // my local test timezone
            record.date_attribute.toString().should.be.equal('2014-02-17')
            record.datetime_attribute.toJSON().should.be.equal('2014-02-18T13:45:02.000Z')
          }else{ // travis-ci timezone
            record.date_attribute.toString().should.be.equal('2014-02-18')
            record.datetime_attribute.toJSON().should.be.equal('2014-02-18T15:45:02.000Z')
          }

          done()
        })
      })
    })
  })
}
