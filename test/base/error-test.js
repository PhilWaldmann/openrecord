var should = require('should');

var Store = require('../../lib/store');

describe('Error', function(){
  var store = new Store();

  store.Model('User', function(){
    this.hasMany('posts');
    this.belongsTo('avatar');
  });
  
  store.Model('Post', function(){
    this.attribute('title');
  });
  
  store.Model('Avatar', function(){
    this.attribute('url');
  });
  
  var User = store.Model('User');
  var phil = new User();
  var michl = new User({
    posts:[{
      title: 'foo'
    }],
    
    avatar: {
      url: 'http://foo.com/img.png'
    }
  });


  describe('errors.add()', function(){
    it('add attribute error', function(){
      phil.errors.add('attribute_name', 'not valid');
    });
    
    it('add base error', function(){
      phil.errors.add('can not be deleted');
    });
    
    
    it('is an array of errors', function(){
      phil.errors['attribute_name'].should.be.an.instanceOf(Array);
      phil.errors['attribute_name'][0].should.be.equal('not valid');
    });
    
    it('has base errors', function(){
      phil.errors['base'].should.be.an.instanceOf(Array);
      phil.errors['base'][0].should.be.equal('can not be deleted');
    });
    
  });
  
  
  describe('relation errors', function(){

    michl.posts[0].errors.add('title', 'some title error');
    michl.avatar.errors.add('url', 'some url error');

    it('has the posts error object on its error obj.', function(){
      michl.errors.should.have.property('posts');
    });
    
    it('has the avatar error object on its error obj.', function(){
      michl.errors.should.have.property('avatar');
    });
    
    it('errors is an array for hasMany', function(){
      michl.errors.posts.should.be.instanceOf(Array);
    });
    
    it('errors is an object for belongsTo', function(){
      michl.errors.avatar.should.not.be.instanceOf(Array);
    });
    
  });
  
});