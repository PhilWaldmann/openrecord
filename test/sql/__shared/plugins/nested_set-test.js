var Store = require('../../../../store')


module.exports = function(title, beforeFn, afterFn, storeConf){
  describe.only(title + ': Nested Set', function(){
    var store

    before(beforeFn)
    after(function(next){
      afterFn(next, store)
    })


    before(function(){
      store = new Store(storeConf)


      store.Model('Folder', function(){
        this.nestedSet()
      })
    })


    it('returns only the first level', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.rootOnly().exec(function(folders){
          folders.length.should.be.equal(2)

          folders[0].children.length.should.be.equal(0)
          folders[1].children.length.should.be.equal(0)
        })
      })
    })


    it('returns the first level and all its children', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.rootOnly().withChildren().exec(function(folders){
          folders.length.should.be.equal(2)

          folders[0].children.length.should.be.equal(1)
          folders[1].children.length.should.be.equal(2)
        })
      })
    })


    it('returns the first level and all nested children', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.rootOnly().withAllChildren().exec(function(folders){
          folders.length.should.be.equal(2)

          folders[0].children.length.should.be.equal(1)
          folders[1].children.length.should.be.equal(2)
          folders[1].children[1].children.length.should.be.equal(1)
          folders[1].children[1].children[0].children.length.should.be.equal(1)
        })
      })
    })

    it('returns the first level and all nested children, but only until depth 1', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.rootOnly().withAllChildren(1).exec(function(folders){
          folders.length.should.be.equal(2)

          folders[0].children.length.should.be.equal(1)
          folders[1].children.length.should.be.equal(2)
          folders[1].children[1].children.length.should.be.equal(0)
        })
      })
    })

    it('returns the first level and all nested children, but only until depth 2', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.rootOnly().withAllChildren(2).exec(function(folders){
          folders.length.should.be.equal(2)

          folders[0].children.length.should.be.equal(1)
          folders[1].children.length.should.be.equal(2)
          folders[1].children[1].children.length.should.be.equal(1)
          folders[1].children[1].children[0].children.length.should.be.equal(0)
        })
      })
    })



    it('adds a new child element', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.find(4).exec(function(folder){
          var originalRgt = folder.rgt

          folder.children.add({
            name: 'B1.1'
          })

          return folder.save(function(){
            return Folder.find(3).withAllChildren(2).exec(function(folder){
              folder.children[0].name.should.be.equal('B1')
              folder.children[0].lft.should.be.equal(folder.lft + 1)
              folder.children[0].rgt.should.be.equal(folder.children[0].lft + 3)

              folder.children[0].children[0].name.should.be.equal('B1.1')
              folder.children[0].children[0].lft.should.be.equal(folder.children[0].lft + 1)
              folder.children[0].children[0].rgt.should.be.equal(folder.children[0].rgt - 1)

              originalRgt.should.not.be.equal(folder.rgt)
            })
          })
        })
      })
    })


    it('adds a new child and sibling element', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.find(6).exec(function(folder){
          var originalRgt = folder.rgt

          folder.children.add({
            name: 'B2.1.2'
          })

          return folder.save(function(){
            return Folder.find(5).withAllChildren().exec(function(folder){
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
            })
          })
        })
      })
    })


    it('moves an  element "up"', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.find(1).exec(function(folder){ // => A
          folder.moveToChildOf(3) // => B

          return folder.save(function(){
            return Folder.find(3).withAllChildren(2).order('lft').exec(function(folder){
              folder.children.length.should.be.equal(3)

              folder.children[2].name.should.be.equal('A')
              folder.children[2].lft.should.not.be.equal(0)
              folder.children[2].rgt.should.not.be.equal(3)
              folder.children[2].depth.should.be.equal(1)
            })
          })
        })
      })
    })



    it('moves an  element "down"', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.find(6).exec(function(folder){ // => B2.1
          folder.moveToChildOf(4) // => B1

          return folder.save(function(){
            return Folder.find(4).withAllChildren().order('lft').exec(function(folder){
              folder.children.length.should.be.equal(2)

              folder.children[1].name.should.be.equal('B2.1')
              folder.children[1].children.length.should.be.equal(2)
            })
          })
        })
      })
    })


    it('deletes a node (and its child nodes)', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.find(1).exec(function(folder){ // => A
          return folder.destroy(function(){
            return Folder.order('lft').exec(function(folders){
              folders.length.should.be.equal(7)

              folders[0].name.should.be.equal('B')
              folders[0].lft.should.be.equal(0)
              folders[0].rgt.should.be.equal(13)
            })
          })
        })
      })
    })



    it('moves an element to the root node', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.find(6).exec(function(folder){ // => B2.1
          folder.parent_id = 3

          return folder.save(function(){
            return Folder.order('lft').exec(function(folders){
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
            })
          })
        })
      })
    })



    it('moves an  element to parent=0', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.find(6).exec(function(folder){ // => B2.1
          folder.parent_id = 0

          return folder.save(function(){
            return Folder.order('lft').exec(function(folders){
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
            })
          })
        })
      })
    })





    it('moves an  element to parent=8 and then parent=0', function(){
      return store.ready(function(){
        var Folder = store.Model('Folder')
        return Folder.find(6).exec(function(folder){ // => B2.1
          folder.parent_id = 8

          return folder.save(function(){
            return Folder.order('lft').exec(function(folders){
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

              return folder.save(function(){
                return Folder.order('lft').exec(function(folders){
                  console.log(folders)
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
                })
              })
            })
          })
        })
      })
    })
  })
}
