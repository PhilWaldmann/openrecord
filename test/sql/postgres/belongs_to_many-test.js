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
      this.hasMany('users')
    })
  })

  after(function(next){
    afterPG(database, next)
  })


  it('does have a proper relation definition', function(){
    return store.ready(function(){
      var User = store.Model('User')

      User.definition.relations.folders.model.definition.model_name.should.be.equal('Folder')
      User.definition.relations.folders.conditions.should.be.eql({id: {attribute: 'folder_ids', model: User}})
    })
  })

  it('does have a proper reverse relation definition', function(){
    return store.ready(function(){
      var Folder = store.Model('Folder')

      Folder.definition.relations.users.model.definition.model_name.should.be.equal('User')
      Folder.definition.relations.users.conditions.should.be.eql({folder_ids: {attribute: 'id', model: Folder}})
    })
  })


  it('does include a belongs_to_many relation', function(){
    return store.ready(function(){
      var User = store.Model('User')
      return User.include('folders').order('id').exec(function(users){
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
      })
    })
  })



  it('does join a belongs_to_many relation', function(){
    return store.ready(function(){
      var User = store.Model('User')
      return User.leftJoin('folders').order('users.id').exec(function(users){
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
      })
    })
  })



  it('does include a the reverse belongs_to_many relation', function(){
    return store.ready(function(){
      var Folder = store.Model('Folder')
      return Folder.find(3).include('users').order('id').exec(function(folder){
        folder.id.should.be.equal(3)
        folder.users.length.should.be.equal(2)
        folder.users[0].id.should.be.equal(2)
        folder.users[1].id.should.be.equal(3)
        folder.users[0].folder_ids.should.be.eql([1, 3])
        folder.users[1].folder_ids.should.be.eql([1, 2, 3])
      })
    })
  })



  it('does join a belongs_to_many relation', function(){
    return store.ready(function(){
      var Folder = store.Model('Folder')
      return Folder.where({id: 3}).join('users').order('users.id').exec(function(folders){
        var folder = folders[0]
        folder.id.should.be.equal(3)
        folder.users.length.should.be.equal(2)
        folder.users[0].id.should.be.equal(2)
        folder.users[1].id.should.be.equal(3)
        folder.users[0].folder_ids.should.be.eql([1, 3])
        folder.users[1].folder_ids.should.be.eql([1, 2, 3])
      })
    })
  })
})
