var Store = require('../../../lib/store')

describe('REST Client: Resource Name', function() {
  var store

  before(function() {
    store = new Store({
      type: 'rest',
      url: 'http://localhost:8889',
      version: '~1.0'
    })

    store.Model('User', function() {})
    store.Model('CamelCasedResourceName', function() {})
  })

  it('has the right resource name', function() {
    return store.ready(function() {
      var User = store.Model('User')
      User.definition.resource.should.be.equal('users')
    })
  })

  it('has the right resource name on camelcased models', function() {
    return store.ready(function() {
      var CamelCasedResourceName = store.Model('CamelCasedResourceName')
      CamelCasedResourceName.definition.resource.should.be.equal(
        'camel_cased_resource_names'
      )
    })
  })

  it("returns a model by it's resource name", function() {
    return store.ready(function() {
      var CamelCasedResourceName = store.getByResource(
        'camel_cased_resource_names'
      )
      CamelCasedResourceName.definition.resource.should.be.equal(
        'camel_cased_resource_names'
      )
    })
  })
})
