var util = require('util');
var validator = require('validator');

/*
 * STORE
 */
exports.store = {

  mixinCallback: function(){
    this.attribute_types = {};

    this.addType(String, function(value){
      if(value === null) return null;
      return validator.toString(value + '');
    });

    this.addType(Number, function(value){
      if(value === null) return null;
      return validator.toFloat(value + '');
    });

    this.addType(Date, function(value){
      if(value === null) return null;
      return validator.toDate(value + '');
    });

    this.addType(Boolean, function(value){
      if(value === null) return null;
      return validator.toBoolean(value + '');
    });

    this.addType(Array, function(value){
      if(value === null) return null;
      if(!util.isArray(value)) return [value];
      return value;
    });

    this.addType(Object, function(value){
      if(value === null) return null;
      return value;
    });

    this.addType(Buffer, {
      input: function(value){
        if(value === null) return null;
        if(value instanceof String) return new Buffer(value, 'hex');
        return new Buffer(value, 'binary');
      },
      output: function(value){
        if(buffer === null) return null;
        return buffer.toString('hex');
      }
    });
  },

  addType: function(name, cast, options){
    options = options || {};

    if(!name) return this.handleException(new Error('No name given'));
    if(!cast) return this.handleException(new Error('No valid cast() method given'));

    if(typeof name == 'string') name = name.toLowerCase();
    if(typeof cast == 'function') cast = {input: cast, output: cast};

    if(options.extend){
      if(typeof options.extend == 'string') options.extend = options.extend.toLowerCase();

      if(this.attribute_types[options.extend]){
        var extend = this.attribute_types[options.extend].cast;

        for(var n in extend){
          if(extend.hasOwnProperty(n) && !cast[n]){
            cast[n] = extend[n];
          }
        }
      }
    }

    if(!cast.input) return this.handleException(new Error('No intput cast() method given'));
    if(!cast.output) return this.handleException(new Error('No output cast() method given'));


    options.name = name;
    options.cast = cast;

    this.attribute_types[name] = options;

  },


  getType: function(name){
    if(typeof name == 'string') name = name.toLowerCase();
    return this.attribute_types[name];
  }
};
