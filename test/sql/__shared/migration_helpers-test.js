var path = require('path')
var Store = require('../../../store')

module.exports = function(title, beforeFn, afterFn, storeConf) {
  describe(title + ': Migration Helpers', function() {
    var store

    before(beforeFn)
    after(function(next) {
      afterFn(next, store)
      process.exit(0)
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

      store.Model('MigrationHelper', function() {})
    })

    it('has the correct column attributes and indexes', function() {
      return store.ready(function () {
        var MigrationHelper = store.Model('MigrationHelper')

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
        //   string_attr length of 42
        //   string_attr_def length of 69
        //   string_attr_def default of 'hrm'
        // * req_string_attr is not null
        //   req_string_attr length of 13
        //   req_string_attr default of 'nice'
        // * foreign_id is integer
        // * req_foreign_id is integer
        // * req_foreign_id not null
        //   index on string_attr
        //   unique on req_string_attr

        MigrationHelper.definition.attributes.string_attr.type.name.should.be.equal('string')
        MigrationHelper.definition.attributes.req_string_attr.notnull.should.be.equal(true)
        MigrationHelper.definition.attributes.foreign_id.type.name.should.be.equal('integer')
        MigrationHelper.definition.attributes.req_foreign_id.type.name.should.be.equal('integer')
        MigrationHelper.definition.attributes.req_foreign_id.notnull.should.be.equal(true)
      })
    })
  })
}
