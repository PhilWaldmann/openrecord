var should = require('should');
var Store = require('../../../lib/store');


describe('Postgres: Array Attributes', function(){
  var store;
  var database = 'array_attributes_test';
  
  
  
  before(function(next){
    this.timeout(5000);
    beforePG(database, [
      'CREATE EXTENSION hstore'
    ], next);
  });
  
  before(function(){
    store = new Store({
      host: 'localhost',
      type: 'postgres',
      database: database,
      user: 'postgres',
      password: '',
      migrations: __dirname + '/fixtures/migrations/*'
    });

    store.Model('ArrayTest', function(){});
    
    store.setMaxListeners(0);
    store.on('exception', function(){});
  });
  
  after(function(next){
    afterPG(database, next);   
  });
    
  var test_values = {
    integer:{
      attr: 'int_arr',
      test_values:[{
        input: '22', output: [22]
      },{
        input: ['22', '13A'], output: [22, 13]
      }]
    },
    
    float:{
      attr: 'float_arr',
      test_values:[{
        input: '22.5', output: [22.5]
      },{
        input: ['22.5', '13.77A'], output: [22.5, 13.77]
      }]
    },
    
    boolean:{
      attr: 'bool_arr',
      test_values:[{
        input: 'true', output: [true]
      },{
        input: ['true', '1', 'false', ''], output: [true, true, false, false]
      }]
    },
        
    date:{
      attr: 'date_arr',
      test_values:[{
        input: '2014-12-24', output: ['2014-12-24']
      },{
        input: ['2014-12-24', new Date('2014-12-25')], output: ['2014-12-24', '2014-12-25']
      }]
    },
    
    datetime:{
      attr: 'datetime_arr',
      test_values:[{
        input: '2014-12-24 12:00:01', output: [new Date('2014-12-24 12:00:01')]
      },{
        input: ['2014-12-24 12:00:01', '2014-12-25 15:22:55'], output: [new Date('2014-12-24 12:00:01'), new Date('2014-12-25 15:22:55')]
      }]
    },
    
    time:{
      attr: 'time_arr',
      test_values:[{
        input: '12:00:01', output: ['12:00:01']
      },{
        input: ['12:00:01', '15:22'], output: ['12:00:01', '15:22:00']
      }]
    },
    
    string:{
      attr: 'str_arr',
      test_values:[{
        input: 2225151, output: ['2225151']
      },{
        input: [2225151, 'foo'], output: ['2225151', 'foo']
      }]
    }
    
  }
  








  
  
  
  
  
  
  
  
  for(var type in test_values){

    (function(type, attr){
      
      it('does have the ' + type + ' array attribute', function(next){
        store.ready(function(){
          var ArrayTest = store.Model('ArrayTest');
          ArrayTest.definition.attributes[attr].type.name.should.be.equal(type + '_array');
          next();
        });
      });
  
      it('casts to ' + type + ' array', function(next){
        store.ready(function(){
          var ArrayTest = store.Model('ArrayTest');
        
          for(var i = 0; i < test_values[type].test_values; i++){
            ArrayTest.definition.attributes[attr].type.cast.read(test_values[type].test_values[i].input).should.be.eql(test_values[type].test_values[i].output);
          }
        
          next();
        });
      });
  
      it('can write and read ' + type + ' array values', function(next){
        store.ready(function(){
          var ArrayTest = store.Model('ArrayTest');
          var tmp = {};
        
          tmp[attr] = test_values[type].test_values[1].input;
        
          ArrayTest.create(tmp, function(success){
            success.should.be.equal(true);
          
            ArrayTest.find(this.id).exec(function(record){
              record[attr].should.be.eql(test_values[type].test_values[1].output);            

              next();
            })
          });
        });
      });
      
    })(type, test_values[type].attr);    
    
  }

  
});