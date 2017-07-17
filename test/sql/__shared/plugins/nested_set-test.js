var Store = require('../../../../lib/store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe(title + ': Nested Set', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)
      store.setMaxListeners(0)

      store.Model('Folder', function(){
        this.nestedSet()
      })
    })


    it('returns only the first level', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.rootOnly().exec(function(folders){
          folders.length.should.be.equal(2)

          folders[0].children.length.should.be.equal(0)
          folders[1].children.length.should.be.equal(0)

          next()
        })
      })
    })


    it('returns the first level and all its children', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.rootOnly().withChildren().exec(function(folders){
          folders.length.should.be.equal(2)

          folders[0].children.length.should.be.equal(1)
          folders[1].children.length.should.be.equal(2)

          next()
        })
      })
    })


    it('returns the first level and all nested children', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.rootOnly().withAllChildren().exec(function(folders){
          folders.length.should.be.equal(2)

          folders[0].children.length.should.be.equal(1)
          folders[1].children.length.should.be.equal(2)
          folders[1].children[1].children.length.should.be.equal(1)
          folders[1].children[1].children[0].children.length.should.be.equal(1)

          next()
        })
      })
    })

    it('returns the first level and all nested children, but only until depth 1', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.rootOnly().withAllChildren(1).exec(function(folders){
          folders.length.should.be.equal(2)

          folders[0].children.length.should.be.equal(1)
          folders[1].children.length.should.be.equal(2)
          folders[1].children[1].children.length.should.be.equal(0)

          next()
        })
      })
    })

    it('returns the first level and all nested children, but only until depth 2', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.rootOnly().withAllChildren(2).exec(function(folders){
          folders.length.should.be.equal(2)

          folders[0].children.length.should.be.equal(1)
          folders[1].children.length.should.be.equal(2)
          folders[1].children[1].children.length.should.be.equal(1)
          folders[1].children[1].children[0].children.length.should.be.equal(0)

          next()
        })
      })
    })



    it('adds a new child element', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.find(4).exec(function(folder){
          var originalRgt = folder.rgt

          folder.children.add({
            name: 'B1.1'
          })

          folder.save(function(success){
            success.should.be.equal(true)

            Folder.find(3).withAllChildren(2).exec(function(folder){
              folder.children[0].name.should.be.equal('B1')
              folder.children[0].lft.should.be.equal(folder.lft + 1)
              folder.children[0].rgt.should.be.equal(folder.children[0].lft + 3)

              folder.children[0].children[0].name.should.be.equal('B1.1')
              folder.children[0].children[0].lft.should.be.equal(folder.children[0].lft + 1)
              folder.children[0].children[0].rgt.should.be.equal(folder.children[0].rgt - 1)

              originalRgt.should.not.be.equal(folder.rgt)
              next()
            })
          })
        })
      })
    })


    it('adds a new child and sibling element', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.find(6).exec(function(folder){
          var originalRgt = folder.rgt

          folder.children.add({
            name: 'B2.1.2'
          })

          folder.save(function(success){
            success.should.be.equal(true)

            Folder.find(5).withAllChildren().exec(function(folder){
              folder.children[0].name.should.be.equal('B2.1')
              folder.children[0].lft.should.be.equal(folder.lft + 1)
              folder.children[0].rgt.should.be.equal(folder.children[0].lft + 5)

              folder.children[0].children.length.should.be.equal(2)

              folder.children[0].children[0].name.should.be.equal('B2.1.1')
              folder.children[0].children[0].lft.should.be.equal(folder.children[0].lft + 1)
              folder.children[0].children[0].rgt.should.be.equal(folder.children[0].children[0].lft + 1)

              folder.children[0].children[1].name.should.be.equal('B2.1.2')
              folder.children[0].children[1].lft.should.be.equal(folder.children[0].lft + 3)
              folder.children[0].children[1].rgt.should.be.equal(folder.children[0].children[1].lft + 1)

              originalRgt.should.not.be.equal(folder.rgt)
              next()
            })
          })
        })
      })
    })


    it('moves an  element "up"', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.find(1).exec(function(folder){ // => A
          folder.moveToChildOf(3) // => B

          folder.save(function(success){
            success.should.be.equal(true)

            Folder.find(3).withAllChildren(2).order('lft').exec(function(folder){
              folder.children.length.should.be.equal(3)

              folder.children[2].name.should.be.equal('A')
              folder.children[2].lft.should.not.be.equal(0)
              folder.children[2].rgt.should.not.be.equal(3)
              folder.children[2].depth.should.be.equal(1)

              next()
            })
          })
        })
      })
    })



    it('moves an  element "down"', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.find(6).exec(function(folder){ // => B2.1
          folder.moveToChildOf(4) // => B1

          folder.save(function(success){
            success.should.be.equal(true)

            Folder.find(4).withAllChildren().order('lft').exec(function(folder){
              folder.children.length.should.be.equal(2)

              folder.children[1].name.should.be.equal('B2.1')
              folder.children[1].children.length.should.be.equal(2)

              next()
            })
          })
        })
      })
    })


    it('deletes a node (and its child nodes)', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.find(1).exec(function(folder){ // => A
          folder.destroy(function(success){
            success.should.be.equal(true)

            Folder.order('lft').exec(function(folders){
              folders.length.should.be.equal(7)

              folders[0].name.should.be.equal('B')
              folders[0].lft.should.be.equal(0)
              folders[0].rgt.should.be.equal(13)

              next()
            })
          })
        })
      })
    })



    it('moves an element to the root node', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.find(6).exec(function(folder){ // => B2.1
          folder.parent_id = 3

          folder.save(function(success){
            success.should.be.equal(true)

            Folder.order('lft').exec(function(folders){
              folders[0].id.should.be.equal(3)
              folders[1].id.should.be.equal(4)
              folders[2].id.should.be.equal(8)
              folders[3].id.should.be.equal(5)
              folders[4].id.should.be.equal(6)
              folders[5].id.should.be.equal(7)
              folders[6].id.should.be.equal(9)

              folders[0].depth.should.be.equal(0)
              folders[1].depth.should.be.equal(1)
              folders[2].depth.should.be.equal(2)
              folders[3].depth.should.be.equal(1)
              folders[4].depth.should.be.equal(1)
              folders[5].depth.should.be.equal(2)
              folders[6].depth.should.be.equal(2)

              next()
            })
          })
        })
      })
    })



    it('moves an  element to parent=0', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.find(6).exec(function(folder){ // => B2.1
          folder.parent_id = 0

          folder.save(function(success){
            success.should.be.equal(true)

            Folder.order('lft').exec(function(folders){
              folders[0].id.should.be.equal(3)
              folders[1].id.should.be.equal(4)
              folders[2].id.should.be.equal(8)
              folders[3].id.should.be.equal(5)
              folders[4].id.should.be.equal(6)
              folders[5].id.should.be.equal(7)
              folders[6].id.should.be.equal(9)

              folders[0].depth.should.be.equal(0)
              folders[1].depth.should.be.equal(1)
              folders[2].depth.should.be.equal(2)
              folders[3].depth.should.be.equal(1)
              folders[4].depth.should.be.equal(0)
              folders[5].depth.should.be.equal(1)
              folders[6].depth.should.be.equal(1)

              folders[0].lft.should.be.equal(0)
              folders[1].lft.should.be.equal(1)
              folders[2].lft.should.be.equal(2)
              folders[3].lft.should.be.equal(5)
              folders[4].lft.should.be.equal(8)
              folders[5].lft.should.be.equal(9)
              folders[6].lft.should.be.equal(11)

              folders[0].rgt.should.be.equal(7)
              folders[1].rgt.should.be.equal(4)
              folders[2].rgt.should.be.equal(3)
              folders[3].rgt.should.be.equal(6)
              folders[4].rgt.should.be.equal(13)
              folders[5].rgt.should.be.equal(10)
              folders[6].rgt.should.be.equal(12)

              next()
            })
          })
        })
      })
    })





    it('moves an  element to parent=8 and then parent=0', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder')
        Folder.find(6).exec(function(folder){ // => B2.1
          folder.parent_id = 8

          folder.save(function(success){
            success.should.be.equal(true)

            Folder.order('lft').exec(function(folders){
              folders[0].id.should.be.equal(3)
              folders[1].id.should.be.equal(4)
              folders[2].id.should.be.equal(8)
              folders[3].id.should.be.equal(6)
              folders[4].id.should.be.equal(7)
              folders[5].id.should.be.equal(9)
              folders[6].id.should.be.equal(5)

              folders[0].depth.should.be.equal(0)
              folders[1].depth.should.be.equal(1)
              folders[2].depth.should.be.equal(2)
              folders[3].depth.should.be.equal(3)
              folders[4].depth.should.be.equal(4)
              folders[5].depth.should.be.equal(4)
              folders[6].depth.should.be.equal(1)


              folder = folders[3] // => B2.1
              folder.parent_id = 0

              folder.save(function(success){
                Folder.order('lft').exec(function(folders){
                  folders[0].id.should.be.equal(3)
                  folders[1].id.should.be.equal(4)
                  folders[2].id.should.be.equal(8)
                  folders[3].id.should.be.equal(5)
                  folders[4].id.should.be.equal(6)
                  folders[5].id.should.be.equal(7)
                  folders[6].id.should.be.equal(9)

                  folders[0].depth.should.be.equal(0)
                  folders[1].depth.should.be.equal(1)
                  folders[2].depth.should.be.equal(2)
                  folders[3].depth.should.be.equal(1)
                  folders[4].depth.should.be.equal(0)
                  folders[5].depth.should.be.equal(1)
                  folders[6].depth.should.be.equal(1)

                  folders[0].lft.should.be.equal(0)
                  folders[1].lft.should.be.equal(1)
                  folders[2].lft.should.be.equal(2)
                  folders[3].lft.should.be.equal(5)
                  folders[4].lft.should.be.equal(8)
                  folders[5].lft.should.be.equal(9)
                  folders[6].lft.should.be.equal(11)

                  folders[0].rgt.should.be.equal(7)
                  folders[1].rgt.should.be.equal(4)
                  folders[2].rgt.should.be.equal(3)
                  folders[3].rgt.should.be.equal(6)
                  folders[4].rgt.should.be.equal(13)
                  folders[5].rgt.should.be.equal(10)
                  folders[6].rgt.should.be.equal(12)

                  next()
                })
              })
            })
          })
        })
      })
    })
  })
}
