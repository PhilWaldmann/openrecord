var Store = require('../../store/base')

describe('Error', function(){
  var store = new Store()

  store.Model('User', function(){
    this.hasMany('posts')
    this.belongsTo('avatar')
  })

  store.Model('Post', function(){
    this.attribute('title')
  })

  store.Model('Avatar', function(){
    this.attribute('url')
  })

  var User, phil

  before(function(){
    return store.ready(function(){
      User = store.Model('User')
      phil = new User()
    })
  })



  describe('errors.add()', function(){
    it('add attribute error', function(){
      phil.errors.add('attribute_name', 'not valid')
    })

    it('add base error', function(){
      phil.errors.add('can not be deleted')
    })


    it('is an array of errors', function(){
      phil.errors.errors['attribute_name'].should.be.an.instanceOf(Array)
      phil.errors.errors['attribute_name'][0].should.be.equal('not valid')
    })

    it('has base errors', function(){
      phil.errors.errors['base'].should.be.an.instanceOf(Array)
      phil.errors.errors['base'][0].should.be.equal('can not be deleted')
    })
  })


  describe('errors.set()', function(){
    it('set multiple attributes', function(){
      phil.errors.set({
        a: 'Error a',
        b: 'Error b'
      })
      phil.errors.errors.a.should.be.eql(['Error a'])
      phil.errors.errors.b.should.be.eql(['Error b'])
    })
  })


  describe('errors.each()', function(){
    it('add attribute error', function(){
      const tmp = []
      phil.errors.each(function(field, error){
        tmp.push(field)
        tmp.push(error)
      })
      tmp.should.be.eql([
        'attribute_name',
        'not valid',
        'base',
        'can not be deleted',
        'a',
        'Error a',
        'b',
        'Error b'
      ])
    })
  })

  describe('errors.toJSON()', function(){
    it('returns the json representation', function(){
      phil.errors.toJSON().should.be.eql({
        attribute_name: [ 'not valid' ],
        a: ['Error a'],
        base: ['can not be deleted'],
        b: ['Error b']
      })
    })
  })

  describe('errors.toString()', function(){
    it('set converts all errors to a string', function(){
      phil.errors.toString().should.be.equal('attribute_name: not valid\ncan not be deleted\na: Error a\nb: Error b')
    })
  })
})
