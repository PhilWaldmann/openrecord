module.exports = function() {
  this.createTable('migration_helpers', function() {
    this.string('string_attr', 42) // includes string len
    this.string('string_attr_def', 69, { default: 'hrm' }) // adds default value
    this.string('req_string_attr!', 13, { default: 'nice' }) // adds not null
    this.id('foreign_id') // id is an integer
    this.id('req_foreign_id!') // adds not null
    this.index('string_attr') // adds index
    this.unique('req_string_attr') // adds unique
  })
}
