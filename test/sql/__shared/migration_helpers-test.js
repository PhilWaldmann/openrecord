var path = require('path')
var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Migration Helpers', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
    })

    before(function() {
      storeConf.migrations = path.join(
        __dirname,
        '..',
        '..',
        'fixtures',
        'migrations',
        '*'
      )
      storeConf.plugins = require('../../../lib/base/dynamic_loading')

      store = new Store(storeConf)
      store.Model('User', function() {}) // for the seeding
      store.Model('MigrationHelper', function() {})
    })

    it('has the correct column attributes and indexes', function() {
      return store.ready(function() {
        var MigrationHelper = store.Model('MigrationHelper')
        var attributes = MigrationHelper.definition.attributes
        // DEFINITIONS:
        // this.string('string_attr', 42) // includes string len
        // this.string('string_attr_def', 69, { default: 'hrm' }) // adds default value
        // this.string('req_string_attr!', 13, { default: 'nice' }) // adds not null
        // this.id('foreign_id') // id is an integer
        // this.id('req_foreign_id!') // adds not null
        // this.index('string_attr') // adds index
        // this.unique('req_string_attr') // adds unique

        // TESTS: (how do I do the check the others???)
        // * string_attr is string
        // * string_attr length of 42
        // * string_attr_def length of 69
        // * string_attr_def default of 'hrm'
        // * req_string_attr is not null
        // * req_string_attr length of 13
        // * req_string_attr default of 'nice'
        // * foreign_id is integer
        // * req_foreign_id is integer
        // * req_foreign_id not null
        //   index on string_attr
        //   unique on req_string_attr

        attributes.string_attr.type.name.should.be.equal('string')
        attributes.string_attr.length.should.be.equal(42)
        attributes.string_attr_def.default.should.be.equal('hrm')
        attributes.string_attr_def.length.should.be.equal(69)
        attributes.req_string_attr.notnull.should.be.equal(true)
        attributes.req_string_attr.default.should.be.equal('nice')
        attributes.req_string_attr.length.should.be.equal(13)
        attributes.foreign_id.type.name.should.be.equal('integer')
        attributes.req_foreign_id.type.name.should.be.equal('integer')
        attributes.req_foreign_id.notnull.should.be.equal(true)
      })
    })
  })
}
