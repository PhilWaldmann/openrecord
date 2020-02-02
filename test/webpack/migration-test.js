const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const OpenRecordCache = require('../../webpack')

const path = require('path')
const fs = require('fs')

describe('Webpack: With migrations (sqlite3)', function() {
  var root = path.join(__dirname, '..', '..')
  var symlink = path.join(root, 'node_modules', 'openrecord')
  var database = path.join(__dirname, 'webpack_migration_test.sqlite3')
  var bundleName = 'bundle-sqlite3-migration.js'
  var storePath = path.join(
    __dirname,
    '..',
    'fixtures',
    'stores',
    'webpack-sqlite3-migrations'
  )

  before(function(next) {
    this.timeout(5000)
    if (!fs.existsSync(symlink)) fs.symlinkSync(root, symlink, 'dir')
    beforeSQLite(
      database,
      [], // table creation should be done via migrations
      next
    )
  })

  after(function() {
    afterSQLite(database)
    const file = path.join(__dirname, bundleName)
    if (fs.existsSync(file)) fs.unlinkSync(file)
    if (fs.existsSync(symlink)) fs.unlinkSync(symlink)
  })

  it('successfully runs webpack with a sqlite3 store', function(next) {
    webpack(
      {
        mode: 'production',
        entry: storePath,
        output: {
          path: __dirname,
          filename: bundleName,
          libraryTarget: 'umd'
        },
        target: 'node',
        node: {
          __dirname: true
        },
        externals: [nodeExternals()],
        plugins: [new OpenRecordCache(require(storePath)(database))]
      },
      function(err, stats) {
        if (err) throw err
        stats.compilation.errors.should.be.eql([])
        next(err)
      }
    )
  })

  it('the original code can query the db', function() {
    const store = require(storePath)(database)
    return store.ready(function() {
      return store
        .Model('user')
        .count()
        .exec()
        .then(function(result) {
          result.should.be.equal(0)
        })
    })
  })

  it('the packed code contains all attributes via cache', function() {
    const store = require(path.join(__dirname, bundleName))(database, true)
    store.cache.should.not.be.eql({})
    return store.ready(function() {
      store
        .Model('user')
        .definition.attributes.should.have.keys('id', 'login', 'first_name')
    })
  })

  it('the packed code can query the db', function() {
    const store = require(path.join(__dirname, bundleName))(database, true)
    return store.ready(function() {
      return store
        .Model('user')
        .count()
        .exec()
        .then(function(result) {
          result.should.be.equal(0)
        })
    })
  })
})
