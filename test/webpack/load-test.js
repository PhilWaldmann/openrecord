const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const path = require('path')
const fs = require('fs')

describe('Webpack: Load (sqlite3)', function(){
  var database = path.join(__dirname, 'webpack_load_test.sqlite3')
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
    const file = path.join(__dirname, 'bundle-sqlite3.js')
    if(fs.existsSync(file)) fs.unlinkSync(file)
  })



  it('successfully runs webpack with a sqlite3 store', function(next){
    webpack({
      entry: storePath,
      output: {
        path: __dirname,
        filename: 'bundle-sqlite3.js',
        libraryTarget: 'umd'
      },
      target: 'node',
      node: {
        __dirname: true
      },
      externals: [nodeExternals()],
      plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true, compress: { warnings: false }})
      ]
    }, function(err, stats) {
      stats.compilation.errors.should.be.eql([])
      next(err)
    })
  })


  it('the original code can query the db', function(){
    const store = require(storePath)(database)
    return store.ready(function(){
      return store.Model('user').count().exec().then(function(result){
        result.should.be.equal(0)
      })
    })
  })


  it('the packed code can query the db', function(){
    const store = require('./bundle-sqlite3')(database)
    return store.ready(function(){
      return store.Model('user').count().exec().then(function(result){
        result.should.be.equal(0)
      })
    })
  })
})






describe('Webpack: Load (postgres)', function(){
  var database = 'webpack_load_test'
  var storePath = path.join(__dirname, '..', 'fixtures', 'stores', 'webpack-postgres')

  before(function(next){
    this.timeout(5000)
    beforePG(database, [
      'CREATE TABLE users(id serial primary key, login TEXT, email TEXT)',
      'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)'
    ], next)
  })

  after(function(next){
    afterPG(database, next)
    const file = path.join(__dirname, 'bundle-postgres.js')
    if(fs.existsSync(file)) fs.unlinkSync(file)
  })



  it('successfully runs webpack with a sqlite3 store', function(next){
    webpack({
      entry: storePath,
      output: {
        path: __dirname,
        filename: 'bundle-postgres.js',
        libraryTarget: 'umd'
      },
      target: 'node',
      node: {
        __dirname: true
      },
      externals: [nodeExternals()],
      plugins: [
        new webpack.optimize.UglifyJsPlugin({minimize: true, compress: { warnings: false }})
      ]
    }, function(err, stats) {
      stats.compilation.errors.should.be.eql([])
      next(err)
    })
  })


  it('the original code can query the db', function(){
    const store = require(storePath)(database)
    return store.ready(function(){
      return store.Model('user').count().exec().then(function(result){
        result.should.be.equal(0)
      })
    })
  })


  it('the packed code can query the db', function(){
    const store = require('./bundle-postgres')(database)
    return store.ready(function(){
      return store.Model('user').count().exec().then(function(result){
        result.should.be.equal(0)
      })
    })
  })
})
