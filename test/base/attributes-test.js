var should = require('should')

var Store = require('../../store/base')

describe('Attributes', function(){
  var store = new Store()

  store.Model('User', function(){
    this.setter('my_setter', function(value){
      this.should.have.property('attributes')
      this.should.have.property('errors')
    })


    this.getter('my_getter', function(){
      this.should.have.property('attributes')
      this.should.have.property('errors')

      return 'test'
    })


    this.attribute('my_str', String, {})
    this.attribute('my_date', Date, {})
    this.attribute('my_number', Number, {})
    this.attribute('my_bool', Boolean, {})

    this.variant('my_str', function(value, args, record){
      return value.substr(0, args.size)
    })
  })

  var User, phil

  before(function(){
    return store.ready(function(){
      User = store.Model('User')
      phil = new User()
    })
  })


  describe('setter()', function(){
    it('has my_setter', function(){
      phil.my_setter = 'test'
    })
  })


  describe('getter()', function(){
    it('has my_getter', function(){
      should.exist(phil.my_getter)
    })

    it('returns the right value', function(){
      phil.my_getter.should.be.equal('test')
    })
  })


  describe('attribute()', function(){
    // String
    it('has my_str (setter)', function(){
      phil.my_str = 'my_value'
    })

    it('has my_str (getter)', function(){
      should.exist(phil.my_str)
    })

    it('my_str returns the right value', function(){
      phil.my_str.should.be.equal('my_value')
    })


    // Date
    it('has my_date (setter)', function(){
      phil.my_date = '2014-10-27'
    })

    it('has my_date (getter)', function(){
      should.exist(phil.my_date)
    })

    it('my_date returns the right value', function(){
      phil.my_date.should.be.a.Date()
    })


    // Number
    it('has my_number (setter)', function(){
      phil.my_number = '10'
    })

    it('has my_number (getter)', function(){
      should.exist(phil.my_number)
    })

    it('my_number returns the right value', function(){
      phil.my_number.should.be.equal(10)
    })


    // Boolean
    it('has my_bool (setter)', function(){
      phil.my_bool = 'true'
    })

    it('has my_bool (getter)', function(){
      should.exist(phil.my_bool)
    })

    it('my_bool returns the right value', function(){
      phil.my_bool.should.be.equal(true)
    })
  })


  describe('set()', function(){
    it('has method', function(){
      phil.set.should.be.a.Function()
    })

    it('set "my_str"', function(){
      phil.set('my_str', 'new_value')
    })

    it('set "unknown_attribute"', function(){
      phil.set('unknown_attribute', 'other_value')
    })
  })


  describe('get()', function(){
    it('has method', function(){
      phil.get.should.be.a.Function()
    })

    it('get "my_str"', function(){
      phil.get('my_str').should.be.equal('new_value')
    })

    it('can not get "unknown_attribute"', function(){
      should.not.exist(phil.get('unknown_attribute'))
    })
  })


  describe('cast()', function(){
    it('has method', function(){
      User.definition.cast.should.be.a.Function()
    })

    it('casts one value', function(){
      User.definition.cast('my_number', '1000').should.be.equal(1000)
    })

    it('casts an array', function(){
      User.definition.cast('my_number', ['1000', '88', 45]).should.be.eql([1000, 88, 45])
    })

    it('casts unknown attribute', function(){
      User.definition.cast('unknown_attr', ['1000', '88', 45]).should.be.eql(['1000', '88', 45])
    })
  })


  describe('hasChanges()', function(){
    var user

    before(function(){
      user = new User({
        my_str: 'phil'
      })
    })

    it('has method', function(){
      user.hasChanges.should.be.a.Function()
    })

    it('returns true on changes', function(){
      user.hasChanges().should.be.equal(true)
    })
  })


  describe('getChanges()', function(){
    var user

    before(function(){
      user = new User({
        my_str: 'phil'
      })
    })

    it('has method', function(){
      user.getChanges.should.be.a.Function()
    })

    it('returns a changes array', function(){
      user.getChanges().should.be.eql({my_str: [null, 'phil']})
    })
  })


  describe('getChangedValues()', function(){
    var user

    before(function(){
      user = new User({
        my_str: 'phil'
      })
    })

    it('has method', function(){
      user.getChangedValues.should.be.a.Function()
    })

    it('returns a changes hash', function(){
      user.getChangedValues().should.be.eql({my_str: 'phil'})
    })
  })


  describe('getChangedValues() with allowed_attributes', function(){
    var user

    before(function(){
      user = new User({
        my_str: 'phil',
        my_number: 3,
        my_bool: true
      })
      user.allowed_attributes = ['my_number', 'my_bool']
    })


    it('returns a modified changes hash', function(){
      user.getChangedValues().should.be.eql({my_number: 3, my_bool: true})
    })
  })


  describe('resetChanges()', function(){
    var user

    before(function(){
      user = new User({
        my_str: 'phil'
      })
    })

    it('has method', function(){
      user.resetChanges.should.be.a.Function()
    })

    it('returns a changes hash', function(){
      user.resetChanges()
      user.hasChanges().should.be.eql(false)
    })
  })


  describe('unknown type', function(){
    it('throws an Error', function(){
      store.Model('Test', function(){
        this.attribute('my_attr', 'unknown_type')
      })
      return store.ready()
      .should.be.rejectedWith(store.UnknownAttributeTypeError, {message: 'Unknown attribute type "unknown_type"'})
    })
  })


  describe('variants', function(){
    var user

    before(function(){
      user = new User({
        my_str: 'phil'
      })
    })

    it('if a attribute variant is defined there is a special attr_name$() method', function(next){
      should.exist(user.my_str$)
      user.my_str$.should.be.a.Function()
      next()
    })


    it('variant returns the right value', function(next){
      user.my_str$({size: 2}).should.be.equal('ph')
      next()
    })
  })
})
