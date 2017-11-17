var Store = require('../../../store/postgres')


describe('Postgres: belongsToMany()', function(){
  var store
  var database = 'belongs_to_many_test'



  before(function(next){
    this.timeout(5000)
    beforePG(database, [
      'CREATE TABLE users(id serial primary key, login TEXT, folder_ids integer[])',
      'CREATE TABLE folders(id serial primary key, name TEXT)',
      "INSERT INTO users(login, folder_ids) VALUES('phil', '{1}'), ('michl', '{1,3}'), ('admin', '{1,2,3}'), ('marlene', '{}')",
      "INSERT INTO folders(name) VALUES('A'), ('B'), ('C'), ('D')"
    ], next)
  })

  before(function(){
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: ''
    })

    store.Model('User', function(){
      this.belongsToMany('folders')
    })

    store.Model('Folder', function(){

    })

    store.setMaxListeners(0)
  })

  after(function(next){
    afterPG(database, next)
  })


  it('does have a proper relation definition', function(next){
    store.ready(function(){
      var User = store.Model('User')

      User.definition.relations.folders.model.definition.model_name.should.be.equal('Folder')
      User.definition.relations.folders.conditions.should.be.eql({id: {attribute: 'folder_ids', model: User}})

      next()
    })
  })


  it('does include a belongs_to_many relation', function(next){
    store.ready(function(){
      var User = store.Model('User')
      User.include('folders').order('id').exec(function(users){
        users.length.should.be.equal(4)
        users[0].folders.length.should.be.equal(1)
        users[0].folders[0].name.should.be.equal('A')
        users[1].folders.length.should.be.equal(2)
        users[1].folders[0].name.should.be.equal('A')
        users[1].folders[1].name.should.be.equal('C')
        users[2].folders.length.should.be.equal(3)
        users[2].folders[0].name.should.be.equal('A')
        users[2].folders[1].name.should.be.equal('B')
        users[2].folders[2].name.should.be.equal('C')
        users[3].folders.length.should.be.equal(0)
        next()
      })
    })
  })



  it('does join a belongs_to_many relation', function(next){
    store.ready(function(){
      var User = store.Model('User')
      User.join('folders').order('users.id').exec(function(users){
        users.length.should.be.equal(4)
        users[0].folders.length.should.be.equal(1)
        users[0].folders[0].name.should.be.equal('A')
        users[1].folders.length.should.be.equal(2)
        users[1].folders[0].name.should.be.equal('A')
        users[1].folders[1].name.should.be.equal('C')
        users[2].folders.length.should.be.equal(3)
        users[2].folders[0].name.should.be.equal('A')
        users[2].folders[1].name.should.be.equal('B')
        users[2].folders[2].name.should.be.equal('C')
        users[3].folders.length.should.be.equal(0)
        next()
      })
    })
  })
})
