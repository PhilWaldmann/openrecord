const should = require('should')
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
      this.belongsToMany('folders', {dependent: 'delete'})
    })

    store.Model('Folder', function(){
      this.hasMany('users', {to: 'folder_ids'})
    })
  })

  after(function(next){
    afterPG(database, next)
  })


  it('does have a proper relation definition', function(){
    return store.ready(function(){
      var User = store.Model('User')
      User.definition.relations.folders.init()
      User.definition.relations.folders.model.definition.modelName.should.be.equal('Folder')
    })
  })

  it('does have a proper reverse relation definition', function(){
    return store.ready(function(){
      var Folder = store.Model('Folder')
      Folder.definition.relations.users.init()
      Folder.definition.relations.users.model.definition.modelName.should.be.equal('User')
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


  it('manually loading', function(){
    return store.ready(function(){
      var User = store.Model('User')
      return User.find(2)
      .then(function(user){
        return user.folders
      })
      .then(function(folders){
        folders.length.should.be.equal(2)
      })
    })
  })


  it('updates a relation id with original relation loaded (belongsToMany)', function(){
    return store.ready(function(){
      var User = store.Model('User')
      return User.find(2).include('folders').exec(function(user){
        user._folders.length.should.be.equal(2)        
        user.folder_ids = [3]
        
        user._folders.length.should.be.equal(1)

        return user.save()
      })
      .then(function(){
        return User.find(2).include('folders')
      })
      .then(function(user){
        user._folders.length.should.be.equal(1)
        user.folder_ids.should.be.eql([3])
      })
    })
  })

  it('dependent delete', function(){
    return store.ready(function(){
      var User = store.Model('User')
      var Folder = store.Model('Folder')
      return User.find(2)
      .then(function(user){
        user.folder_ids.should.be.eql([3])
       return user.destroy()
      })
      .then(function(){
        return Folder.find(3)
      })
      .then(function(folder){
        should.not.exist(folder)
      })
    })
  })
})
