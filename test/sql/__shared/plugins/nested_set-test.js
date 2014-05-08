var should = require('should');
var Store = require('../../../../lib/store');


module.exports = function(title, beforeFn, afterFn, store_conf){
  
  describe(title + ': Nested Set', function(){
    var store;
  
    before(beforeFn);
    after(function(next){
      afterFn(next, store);
    });
  
  
    before(function(){
      store = new Store(store_conf);
      store.setMaxListeners(0);
      
      store.Model('Folder', function(){
        this.nestedSet();
      });
    });
    
    
    it('returns only the first level', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder');
        Folder.rootOnly().exec(function(folders){

          folders.length.should.be.equal(2);
          
          folders[0].children.length.should.be.equal(0);
          folders[1].children.length.should.be.equal(0);
          
          next();
        });
      });      
    });
    
    
    it('returns the first level and all its children', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder');
        Folder.rootOnly().withChildren().exec(function(folders){

          folders.length.should.be.equal(2);
          
          folders[0].children.length.should.be.equal(1);
          folders[1].children.length.should.be.equal(2);
          
          next();
        });
      });      
    });
    
    
    it('returns the first level and all nested children', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder');
        Folder.rootOnly().withAllChildren().exec(function(folders){
          folders.length.should.be.equal(2);
          
          folders[0].children.length.should.be.equal(1);
          folders[1].children.length.should.be.equal(2);
          folders[1].children[1].children.length.should.be.equal(1);
          folders[1].children[1].children[0].children.length.should.be.equal(1);
          
          next();
        });
      });      
    });
    
    it('returns the first level and all nested children, but only until depth 1', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder');
        Folder.rootOnly().withAllChildren(1).exec(function(folders){
          folders.length.should.be.equal(2);
          
          folders[0].children.length.should.be.equal(1);
          folders[1].children.length.should.be.equal(2);
          folders[1].children[1].children.length.should.be.equal(0);
          
          next();
        });
      });      
    });
    
    it('returns the first level and all nested children, but only until depth 2', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder');
        Folder.rootOnly().withAllChildren(2).exec(function(folders){

          folders.length.should.be.equal(2);
          
          folders[0].children.length.should.be.equal(1);
          folders[1].children.length.should.be.equal(2);
          folders[1].children[1].children.length.should.be.equal(1);
          folders[1].children[1].children[0].children.length.should.be.equal(0);
          
          next();
        });
      });      
    });
    
    
    
    it('adds a new child element', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder');
        Folder.find(4).exec(function(folder){

          var original_rgt = folder.rgt;
          
          folder.children.add({
            name: 'B1.1'
          });
          
          folder.save(function(success){
            success.should.be.true;
            
            Folder.find(3).withAllChildren(2).exec(function(folder){

              folder.children[0].name.should.be.equal('B1');
              folder.children[0].lft.should.be.equal(folder.lft + 1);
              folder.children[0].rgt.should.be.equal(folder.children[0].lft + 3);
              
              folder.children[0].children[0].name.should.be.equal('B1.1');
              folder.children[0].children[0].lft.should.be.equal(folder.children[0].lft + 1);
              folder.children[0].children[0].rgt.should.be.equal(folder.children[0].rgt - 1);
              
              original_rgt.should.not.be.equal(folder.rgt);
              next();
            });
          });
        });
      });      
    });
    
    
    it('adds a new child and sibling element', function(next){
      store.ready(function(){
        var Folder = store.Model('Folder');
        Folder.find(6).exec(function(folder){

          var original_rgt = folder.rgt;
          
          folder.children.add({
            name: 'B2.1.2'
          });
          
          folder.save(function(success){
            success.should.be.true;
            
            Folder.find(5).withAllChildren().exec(function(folder){

              folder.children[0].name.should.be.equal('B2.1');
              folder.children[0].lft.should.be.equal(folder.lft + 1);
              folder.children[0].rgt.should.be.equal(folder.children[0].lft + 5);
              
              folder.children[0].children.length.should.be.equal(2);
              
              folder.children[0].children[0].name.should.be.equal('B2.1.1');
              folder.children[0].children[0].lft.should.be.equal(folder.children[0].lft + 1);
              folder.children[0].children[0].rgt.should.be.equal(folder.children[0].children[0].lft + 1);
              
              folder.children[0].children[1].name.should.be.equal('B2.1.2');
              folder.children[0].children[1].lft.should.be.equal(folder.children[0].lft + 3);
              folder.children[0].children[1].rgt.should.be.equal(folder.children[0].children[1].lft + 1);
              
              original_rgt.should.not.be.equal(folder.rgt);
              next();
            });
          });
        });
      });      
    });        
    
  });
};