var Store = require('../../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Sorted List', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)


      store.Model('MyList', function(){
        this.sortedList({
          insert: 'beginning'
        })
      })
      store.Model('MyScopedList', function(){
        this.sortedList({scope: 'my_scope'})
      })
    })


    it('returns a sorted result', function(){
      return store.ready(function(){
        var MyList = store.Model('MyList')
        return MyList.exec(function(list){
          list.length.should.be.equal(7)

          list[0].name.should.be.equal('A')
          list[1].name.should.be.equal('B')
          list[2].name.should.be.equal('C')
          list[3].name.should.be.equal('D')
          list[4].name.should.be.equal('E')
          list[5].name.should.be.equal('F')
          list[6].name.should.be.equal('G')
        })
      })
    })


    it('inserts a new record at the beginning of a list', function(){
      return store.ready(function(){
        var MyList = store.Model('MyList')

        return MyList.create({
          name: '-'
        })
        .then(function(){
          return MyList.exec()
        })
        .then(function(list){
          list.length.should.be.equal(8)

          list[0].name.should.be.equal('-')
          list[1].name.should.be.equal('A')
          list[2].name.should.be.equal('B')
          list[3].name.should.be.equal('C')
          list[4].name.should.be.equal('D')
          list[5].name.should.be.equal('E')
          list[6].name.should.be.equal('F')
          list[7].name.should.be.equal('G')

          list[1].position.should.be.equal(1)
        })
      })
    })


    it('inserts a new record in the middle of a list', function(){
      return store.ready(function(){
        var MyList = store.Model('MyList')

        return MyList.create({
          name: '/',
          position: 4
        })
        .then(function(){
          return MyList.exec()
        })
        .then(function(list){
          list.length.should.be.equal(9)

          list[0].name.should.be.equal('-')
          list[1].name.should.be.equal('A')
          list[2].name.should.be.equal('B')
          list[3].name.should.be.equal('C')
          list[4].name.should.be.equal('/')
          list[5].name.should.be.equal('D')
          list[6].name.should.be.equal('E')
          list[7].name.should.be.equal('F')
          list[8].name.should.be.equal('G')

          list[5].position.should.be.equal(5)
        })
      })
    })


    it('moves a record down', function(){
      return store.ready(function(){
        var MyList = store.Model('MyList')

        return MyList.find(6)
        .then(function(item){
          item.position = 5
          item.name = 'B-'

          return item.save()
        })
        .then(function(){
          return MyList.exec()
        })
        .then(function(list){
          list.length.should.be.equal(9)

          list[0].name.should.be.equal('-')
          list[1].name.should.be.equal('A')
          list[2].name.should.be.equal('C')
          list[3].name.should.be.equal('/')
          list[4].name.should.be.equal('D')
          list[5].name.should.be.equal('B-')
          list[6].name.should.be.equal('E')
          list[7].name.should.be.equal('F')
          list[8].name.should.be.equal('G')
        })
      })
    })



    it('moves a record up', function(){
      return store.ready(function(){
        var MyList = store.Model('MyList')

        return MyList.find(3)
        .then(function(item){
          item.position = 2
          item.name = 'F+'

          return item.save()
        })
        .then(function(){
          return MyList.exec()
        })
        .then(function(list){
          list.length.should.be.equal(9)

          list[0].name.should.be.equal('-')
          list[1].name.should.be.equal('A')
          list[2].name.should.be.equal('F+')
          list[3].name.should.be.equal('C')
          list[4].name.should.be.equal('/')
          list[5].name.should.be.equal('D')
          list[6].name.should.be.equal('B-')
          list[7].name.should.be.equal('E')
          list[8].name.should.be.equal('G')
        })
      })
    })


    it('destroys a record', function(){
      return store.ready(function(){
        var MyList = store.Model('MyList')

        return MyList.find(9)
        .then(function(item){
          return item.destroy()
        })
        .then(function(){
          return MyList.exec()
        })
        .then(function(list){
          list.length.should.be.equal(8)

          list[0].name.should.be.equal('-')
          list[1].name.should.be.equal('A')
          list[2].name.should.be.equal('F+')
          list[3].name.should.be.equal('C')
          list[4].name.should.be.equal('D')
          list[5].name.should.be.equal('B-')
          list[6].name.should.be.equal('E')
          list[7].name.should.be.equal('G')

          list[4].position.should.be.equal(4)
          list[5].position.should.be.equal(5)
          list[6].position.should.be.equal(6)
          list[7].position.should.be.equal(7)
        })
      })
    })









    it('returns a sorted result (with a scope column)', function(){
      return store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')
        return MyScopedList.exec(function(list){
          list.length.should.be.equal(7)
          list[0].name.should.be.equal('A1')
          list[1].name.should.be.equal('B1')
          list[2].name.should.be.equal('C1')
          list[3].name.should.be.equal('D1')
          list[4].name.should.be.equal('A2')
          list[5].name.should.be.equal('B2')
          list[6].name.should.be.equal('A3')
        })
      })
    })



    it('inserts a new record at the end of a list (with a scope column)', function(){
      return store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        return MyScopedList.create({
          name: '-',
          my_scope: 1
        })
        .then(function(){
          return MyScopedList.exec()
        })
        .then(function(list){
          list.length.should.be.equal(8)
          list[0].name.should.be.equal('A1')
          list[1].name.should.be.equal('B1')
          list[2].name.should.be.equal('C1')
          list[3].name.should.be.equal('D1')
          list[4].name.should.be.equal('-')
          list[5].name.should.be.equal('A2')
          list[6].name.should.be.equal('B2')
          list[7].name.should.be.equal('A3')
        })
      })
    })


    it('inserts a new record in the middle of a list (with a scope column)', function(){
      return store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        return MyScopedList.create({
          name: '/',
          position: 1,
          my_scope: 1
        })
        .then(function(){
          return MyScopedList.exec()
        })
        .then(function(list){
          list.length.should.be.equal(9)

          list[0].name.should.be.equal('A1')
          list[1].name.should.be.equal('/')
          list[2].name.should.be.equal('B1')
          list[3].name.should.be.equal('C1')
          list[4].name.should.be.equal('D1')
          list[5].name.should.be.equal('-')
          list[6].name.should.be.equal('A2')
          list[7].name.should.be.equal('B2')
          list[8].name.should.be.equal('A3')

          list[2].position.should.be.equal(2)
          list[7].position.should.be.equal(1)
        })
      })
    })


    it('moves a record down (with a scope column)', function(){
      return store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        return MyScopedList.find(5)
        .then(function(item){
          item.position = 1
          item.name = 'A2-'

          return item.save()
        })
        .then(function(){
          return MyScopedList.exec()
        })
        .then(function(list){
          list.length.should.be.equal(9)

          list[0].name.should.be.equal('A1')
          list[1].name.should.be.equal('/')
          list[2].name.should.be.equal('B1')
          list[3].name.should.be.equal('C1')
          list[4].name.should.be.equal('D1')
          list[5].name.should.be.equal('-')
          list[6].name.should.be.equal('B2')
          list[7].name.should.be.equal('A2-')
          list[8].name.should.be.equal('A3')

          list[0].position.should.be.equal(0)
          list[8].position.should.be.equal(0)
        })
      })
    })



    it('moves a record up (with a scope column)', function(){
      return store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        return MyScopedList.find(9)
        .then(function(item){
          item.position = 0
          item.name = '/+'

          return item.save()
        })
        .then(function(){
          return MyScopedList.exec()
        })
        .then(function(list){
          list.length.should.be.equal(9)

          list[0].name.should.be.equal('/+')
          list[1].name.should.be.equal('A1')
          list[2].name.should.be.equal('B1')
          list[3].name.should.be.equal('C1')
          list[4].name.should.be.equal('D1')
          list[5].name.should.be.equal('-')
          list[6].name.should.be.equal('B2')
          list[7].name.should.be.equal('A2-')
          list[8].name.should.be.equal('A3')

          list[6].position.should.be.equal(0)
          list[7].position.should.be.equal(1)
          list[8].position.should.be.equal(0)
        })
      })
    })


    it('destroys a record (with a scope column)', function(){
      return store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        return MyScopedList.find(6)
        .then(function(item){
          return item.destroy()
        })
        .then(function(){
          return MyScopedList.exec()
        })
        .then(function(list){
          list.length.should.be.equal(8)

          list[0].name.should.be.equal('/+')
          list[1].name.should.be.equal('A1')
          list[2].name.should.be.equal('C1')
          list[3].name.should.be.equal('D1')
          list[4].name.should.be.equal('-')
          list[5].name.should.be.equal('B2')
          list[6].name.should.be.equal('A2-')
          list[7].name.should.be.equal('A3')

          list[3].position.should.be.equal(3)
          list[4].position.should.be.equal(4)
          list[5].position.should.be.equal(0)
        })
      })
    })




    it('moves a record from one scope to another', function(){
      return store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        return MyScopedList.find(7).exec(function(item){
          item.my_scope = 2
          item.name = 'C2'

          return item.save()
          .then(function(){
            return MyScopedList.exec()
          })
          .then(function(list){
            list.length.should.be.equal(8)

            list[0].name.should.be.equal('/+')
            list[1].name.should.be.equal('A1')
            list[2].name.should.be.equal('D1')
            list[3].name.should.be.equal('-')
            list[4].name.should.be.equal('B2')
            list[5].name.should.be.equal('A2-')
            list[6].name.should.be.equal('C2')
            list[7].name.should.be.equal('A3')

            list[0].position.should.be.equal(0)
            list[1].position.should.be.equal(1)
            list[2].position.should.be.equal(2)
            list[3].position.should.be.equal(3)
            list[4].position.should.be.equal(0)
            list[5].position.should.be.equal(1)
            list[6].position.should.be.equal(2)
          })
        })
      })
    })



    it('moves a record from one scope to a new one', function(){
      return store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        return MyScopedList.find(1).exec(function(item){
          item.my_scope = 5
          item.name = 'NEW'

          return item.save()
        })
        .then(function(){
          return MyScopedList.exec()
        })
        .then(function(list){
          list.length.should.be.equal(8)

          list[0].name.should.be.equal('/+')
          list[1].name.should.be.equal('A1')
          list[2].name.should.be.equal('D1')
          list[3].name.should.be.equal('-')
          list[4].name.should.be.equal('A2-')
          list[5].name.should.be.equal('C2')
          list[6].name.should.be.equal('A3')
          list[7].name.should.be.equal('NEW')

          list[4].position.should.be.equal(0)
          list[5].position.should.be.equal(1)
          list[7].position.should.be.equal(0)
        })
      })
    })
  })
}
