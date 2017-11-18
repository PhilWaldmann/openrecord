const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const OpenRecordCache = require('../../webpack')

const path = require('path')
const fs = require('fs')

describe.skip('Webpack: With cache plugin', function(){
  var database = path.join(__dirname, 'webpack_cache_test.sqlite3')
  var storePath = path.join(__dirname, '..', 'fixtures', 'stores', 'webpack-sqlite3')

  before(function(next){
    this.timeout(5000)
    beforeSQLite(database, [
      'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT)',
      'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)'
    ], next)
  })

  after(function(){
    afterSQLite(database)
    const file = path.join(__dirname, 'bundle.js')
    if(fs.existsSync(file)) fs.unlinkSync(file)
  })



  it('successfully runs webpack with a sqlite3 store', function(next){
    webpack({
      entry: storePath,
      output: {
        path: __dirname,
        filename: 'bundle.js',
        libraryTarget: 'umd'
      },
      target: 'node',
      node: {
        __dirname: true
      },
      externals: [nodeExternals()],
      plugins: [
        new OpenRecordCache(require(storePath)(database)),
        new webpack.optimize.UglifyJsPlugin({minimize: true, compress: { warnings: false }})
      ]
    }, function(err, stats) {
      stats.compilation.errors.should.be.eql([])
      process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }) + '\n\n')
      next(err)
    })
  })


  it('the original code can query the db', function(next){
    const store = require(storePath)(database)
    store.ready(function(){
      store.Model('user').count().exec().then(function(result){
        result.should.be.equal(0)
        next()
      })
    })
  })


  it('the packed code can query the db', function(next){
    const store = require('./bundle')(database)
    store.ready(function(){
      store.Model('user').count().exec().then(function(result){
        result.should.be.equal(0)
        next()
      })
    })
  })
})
