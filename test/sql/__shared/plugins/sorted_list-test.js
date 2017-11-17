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
      store.setMaxListeners(0)

      store.Model('MyList', function(){
        this.sortedList({
          insert: 'beginning'
        })
      })
      store.Model('MyScopedList', function(){
        this.sortedList({scope: 'my_scope'})
      })
    })


    it('returns a sorted result', function(next){
      store.ready(function(){
        var MyList = store.Model('MyList')
        MyList.exec(function(list){
          list.length.should.be.equal(7)

          list[0].name.should.be.equal('A')
          list[1].name.should.be.equal('B')
          list[2].name.should.be.equal('C')
          list[3].name.should.be.equal('D')
          list[4].name.should.be.equal('E')
          list[5].name.should.be.equal('F')
          list[6].name.should.be.equal('G')

          next()
        })
      })
    })


    it('inserts a new record at the beginning of a list', function(next){
      store.ready(function(){
        var MyList = store.Model('MyList')

        MyList.create({
          name: '-'
        }).then(function(){
          MyList.exec(function(list){
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

            next()
          })
        })
      })
    })


    it('inserts a new record in the middle of a list', function(next){
      store.ready(function(){
        var MyList = store.Model('MyList')

        MyList.create({
          name: '/',
          position: 4
        }).then(function(){
          MyList.exec(function(list){
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

            next()
          })
        })
      })
    })


    it('moves a record down', function(next){
      store.ready(function(){
        var MyList = store.Model('MyList')

        MyList.find(6).exec(function(item){
          item.position = 5
          item.name = 'B-'

          item.save(function(){
            MyList.exec(function(list){
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

              next()
            })
          })
        })
      })
    })



    it('moves a record up', function(next){
      store.ready(function(){
        var MyList = store.Model('MyList')

        MyList.find(3).exec(function(item){
          item.position = 2
          item.name = 'F+'

          item.save(function(){
            MyList.exec(function(list){
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

              next()
            })
          })
        })
      })
    })


    it('destroys a record', function(next){
      store.ready(function(){
        var MyList = store.Model('MyList')

        MyList.find(9).exec(function(item){
          item.destroy(function(){
            MyList.exec(function(list){
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

              next()
            })
          })
        })
      })
    })









    it('returns a sorted result (with a scope column)', function(next){
      store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')
        MyScopedList.exec(function(list){
          list.length.should.be.equal(7)
          list[0].name.should.be.equal('A1')
          list[1].name.should.be.equal('B1')
          list[2].name.should.be.equal('C1')
          list[3].name.should.be.equal('D1')
          list[4].name.should.be.equal('A2')
          list[5].name.should.be.equal('B2')
          list[6].name.should.be.equal('A3')

          next()
        })
      })
    })



    it('inserts a new record at the end of a list (with a scope column)', function(next){
      store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        MyScopedList.create({
          name: '-',
          my_scope: 1
        }).then(function(){
          MyScopedList.exec(function(list){
            list.length.should.be.equal(8)
            list[0].name.should.be.equal('A1')
            list[1].name.should.be.equal('B1')
            list[2].name.should.be.equal('C1')
            list[3].name.should.be.equal('D1')
            list[4].name.should.be.equal('-')
            list[5].name.should.be.equal('A2')
            list[6].name.should.be.equal('B2')
            list[7].name.should.be.equal('A3')

            next()
          })
        })
      })
    })


    it('inserts a new record in the middle of a list (with a scope column)', function(next){
      store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        MyScopedList.create({
          name: '/',
          position: 1,
          my_scope: 1
        }).then(function(){
          MyScopedList.exec(function(list){
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

            next()
          })
        })
      })
    })


    it('moves a record down (with a scope column)', function(next){
      store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        MyScopedList.find(5).exec(function(item){
          item.position = 1
          item.name = 'A2-'

          item.save(function(){
            MyScopedList.exec(function(list){
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

              next()
            })
          })
        })
      })
    })



    it('moves a record up (with a scope column)', function(next){
      store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        MyScopedList.find(9).exec(function(item){
          item.position = 0
          item.name = '/+'

          item.save(function(){
            MyScopedList.exec(function(list){
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

              next()
            })
          })
        })
      })
    })


    it('destroys a record (with a scope column)', function(next){
      store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        MyScopedList.find(6).exec(function(item){
          item.destroy(function(){
            MyScopedList.exec(function(list){
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

              next()
            })
          })
        })
      })
    })




    it('moves a record from one scope to another', function(next){
      store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        MyScopedList.find(7).exec(function(item){
          item.my_scope = 2
          item.name = 'C2'

          item.save(function(){
            MyScopedList.exec(function(list){
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

              next()
            })
          })
        })
      })
    })



    it('moves a record from one scope to a new one', function(next){
      store.ready(function(){
        var MyScopedList = store.Model('MyScopedList')

        MyScopedList.find(1).exec(function(item){
          item.my_scope = 5
          item.name = 'NEW'

          item.save(function(){
            MyScopedList.exec(function(list){
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

              next()
            })
          })
        })
      })
    })
  })
}
