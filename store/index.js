const Store = require('../lib/store')

require('./base')
require('./sql')
require('./postgres')
require('./sqlite3')
require('./mysql')
require('./oracle')
require('./rest')
require('./ldap')
require('./activedirectory')

// reset type to get it via constructor config object
Store.type = null

module.exports = Store
