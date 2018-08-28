var Store = require('../../../store/postgres')

describe.only('Postgres: geometric Attributes', function() {
  var store
  var database = 'geometric_attributes_test'

  before(function(next) {
    this.timeout(5000)
    beforePG(
      database,
      [
        'CREATE TABLE attribute_tests(id serial primary key, point_attribute point, line_attribute line, lseg_attribute lseg, box_attribute box, path_attribute path, polygon_attribute polygon, circle_attribute circle)',
        "INSERT INTO attribute_tests (point_attribute, line_attribute, lseg_attribute, box_attribute, path_attribute, polygon_attribute, circle_attribute)VALUES('(1,2)', '[(1,2),(4,5.88)]', '[(1.5,2),(6,3)]', '((3,2),(7,10.4))', '[(1,1),(10,10),(7.7,5),(5,7.7)]', '((0,0.3),(5,10),(10,5))', '<(0,0),6.33>')"
      ],
      next
    )
  })

  before(function() {
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: ''
    })

    store.Model('AttributeTest', function() {
    })
  })

  after(function(next) {
    afterPG(database, next)
  })

  it('has all attributes loaded', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')

      var attrs = AttributeTest.definition.attributes

      attrs.should.have.property('point_attribute')
      attrs.should.have.property('line_attribute')
      attrs.should.have.property('lseg_attribute')
      attrs.should.have.property('box_attribute')
      attrs.should.have.property('path_attribute')
      attrs.should.have.property('polygon_attribute')
      attrs.should.have.property('circle_attribute')
    })
  })

  it('casts all values', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')
      return AttributeTest.first()
      .then(function(record) {
        record.point_attribute.should.be.eql({x:1, y:2})
        record.line_attribute.should.be.eql({A:1.29333333333333, B:-1, C:0.706666666666667})
        record.lseg_attribute.should.be.eql([{x:1.5, y:2}, {x:6, y:3}])
        record.box_attribute.should.be.eql([{x:7, y:10.4}, {x:3, y:2}])
        record.path_attribute.should.be.eql([{x:1, y:1}, {x:10, y:10}, {x:7.7, y:5}, {x:5, y:7.7}])
        record.polygon_attribute.should.be.eql([{x:0, y:0.3}, {x:5, y:10}, {x:10, y:5}])
        record.circle_attribute.should.be.eql({x:0, y:0, radius:6.33})
      })
    })
  })

  it('write all values', function() {
    return store.ready(function() {
      var AttributeTest = store.Model('AttributeTest')

      return AttributeTest.create({
        point_attribute: {x:5.5, y:7},
        line_attribute: [{x:5.5, y:5.5}, {x:10, y:10}],
        lseg_attribute: [{x:5.5, y:5.5}, {x:10, y:10}],
        box_attribute: [{x:10, y:10}, {x:5.5, y:5.5}],
        path_attribute: [{x:0, y:0}, {x:0, y:5.5}, {x:5.5, y:0}],
        polygon_attribute: [{x:0, y:0}, {x:0, y:5.5}, {x:5.5, y:0}],
        circle_attribute: {x:10, y:5.5, radius:7}
      })
      .then(function(){
        return AttributeTest.find(2)
      })
      .then(function(record){
        record.point_attribute.should.be.eql({x:5.5, y:7})
        record.line_attribute.should.be.eql({A:1, B:-1, C:0})
        record.lseg_attribute.should.be.eql([{x:5.5, y:5.5}, {x:10, y:10}])
        record.box_attribute.should.be.eql([{x:10, y:10}, {x:5.5, y:5.5}])
        record.path_attribute.should.be.eql([{x:0, y:0}, {x:0, y:5.5}, {x:5.5, y:0}])
        record.polygon_attribute.should.be.eql([{x:0, y:0}, {x:0, y:5.5}, {x:5.5, y:0}])
        record.circle_attribute.should.be.eql({x:10, y:5.5, radius:7})
      })
    })
  })
})
