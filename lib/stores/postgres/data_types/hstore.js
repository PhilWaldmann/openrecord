var validator = require('validator');

exports.store = {
  
  mixinCallback: function(){
    var store = this;
        
    this.addType('hstore', {
      output: function(val){
        if(!val) return {};
        return val;
      },
      
      read: function(val){
        if(val instanceof Object) return val;
        if(val === null) return null;
        
        var tmp = null;
        
        try{
          tmp = parse(val, {numeric_check: true});
        }catch(e){
          return null;
        }
        
        
        for(var key in tmp){
          if(tmp.hasOwnProperty(key) && typeof tmp[key] === 'string' && tmp[key].match(/(\{|\[)/)){
            try{
              tmp[key] = JSON.parse(tmp[key]);
            }catch(e){}
          }
        }
        
        return tmp;
      },
      write: function(object){
        if(object === null) return null;
        
        for(var key in object){
          if(object.hasOwnProperty(key) && typeof object[key] === 'object'){
            object[key] = JSON.stringify(object[key]);
          }
        }
        
        return stringify(object);
      }
    }, {
      migration:['hstore'],
      operators:{
        defaults: ['eq', 'not']
      },
      
      sorter: function(name){
        var tmp = name.match(/(.+)\.([a-zA-Z\_\-]+)$/);
        if(tmp){
          return store.connection.raw(tmp[1] + "->'" + tmp[2] + "'");
        }
        return name;
      }
    });
        
  }
};




// from https://github.com/yeaha/hstore-js

var default_options = exports.options = {
    array_square_brackets: false,
    boolean_as_integer: false,
    numeric_check: false,
    root_hash_decorated: false,
    return_postgresql_expression: false,     // stringify
    convert_boolean_and_null: true
};


function stringify(data, options, top) {
    function normalize(data) {
        if (data === null)
            return 'NULL';

        if (data === '')
            return '""';

        if (data === true || data === false) {
            if (options.boolean_as_integer) {
                return data ? 1 : 0;
            } else {
                if (!options.convert_boolean_and_null)
                    return data ? 't' : 'f';
                else return data ? 'true' : 'false'
            }
        }

        if (Object.prototype.toString.call(data) == '[object Number]')
            return data;

        return '"'+escape(data)+'"';
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    if (top === undefined)
        top = true;

    if (top)
        options = normalize_options(options);

    var is_array = (Object.prototype.toString.call(data) == '[object Array]');
    var value, hstore = [];

    for (var key in data) {
        value = data[key];

        value = (value === Object(value)) // is object?
              ? stringify(value, options, false)
              : normalize(value);
        key = '"'+escape(key)+'"';

        hstore.push(is_array ? value : key+'=>'+value);
    }

    hstore = hstore.join(',');

    if (!top || options.root_hash_decorated)
        hstore = (is_array && options.array_square_brackets)
               ? '['+hstore+']'
               : '{'+hstore+'}';

    // return as postgresql hstore expression
    if (options.return_postgresql_expression)
        hstore = "'"+hstore.replace(new RegExp("'", 'g'), "''")+"'::hstore";

    return hstore;
};

function parse(hstore, options) {
    options = normalize_options(options);

    if (!options.root_hash_decorated)
        hstore = '{'+hstore+'}';

    var machine = fsm();

    for (var env, c, n, p, i = 0, len = hstore.length; i < len; i++) {
        // current
        c = (i === 0) ? hstore[i] : n;
        // next
        n = (i+1 < len) ? hstore[i+1] : undefined;

        env = machine(c, p, n);

        // previous
        p = c;
    }

    if (env.state != 'ok')
        throw new SyntaxError('Unexpected end of input');

    return combine(env.container, options);
};

function normalize_options(options) {
    if (options === undefined)
        return default_options;

    for (var k in default_options) {
        if (options[k] === undefined)
            options[k] = default_options[k];
    }

    return options;
}

function fsm() {
    function push(c) {
        var env = {
            state: state,
            close_char: c == '[' ? ']' : '}'
        };

        if (container)
            env.container = container;
        if (element)
            env.element = element;

        stack.push(env);

        element = undefined;
        container = [];
        state = 'firstchar';
    }

    function pop(c) {
        var pop = stack.pop();

        if (pop.close_char != c)
            throw new SyntaxError('Unexpected token '+c);

        state = pop.state;

        if (pop.container) {
            element = pop.element || {};
            element.value = container;

            container = pop.container;
            state = 'comma';
        }
    }

    function fill(c) {
        if (element === undefined)
            element = {key: ''};

        if (element.value === undefined) {
            element.key += c;
        } else {
            element.value += c;
        }

        if (quoted && !element.quoted)
            element.quoted = true;
    }

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    var backslash_repeat, container, element;
    var stack = [];
    var state = 'ok';
    var quoted = false;

    var actions = {
        ok: function(c) {
            if (c == '{' || c == '[')
                push(c);
        },
        firstchar: function(c, p, n) {
            if (c == ' ')   // ignore white space
                return;

            if (c == ',')
                throw new SyntaxError('Unexpected token '+c);

            if (c == '{' || c == '[')
                return push(c);

            if (c == '}' || c == ']')
                return pop(c);

            if (c == '"' && (p != '\\' || backslash_repeat % 2 === 0)) {
                quoted = !quoted;
            } else {
                fill(c);
            }

            if (!quoted && (n == ',' || n == '}' || n == ']')) {
                state = 'comma';
            } else {
                state = 'keyvalue';
            }
        },
        keyvalue: function(c, p, n) {
            var ignore = false;
            if (c == '"' && (p != '\\' || backslash_repeat % 2 === 0)) {
                quoted = !quoted;
                ignore = true;
            }

            if (!quoted && c == ' ')
                ignore = true;

            if (!quoted && c == '=' && n == '>')
                return state = 'arrow';

            if (!ignore)
                fill(c);

            if (!quoted && (n == ',' || n == '}' || n == ']'))
                return state = 'comma';
        },
        arrow: function(c, p, n) {
            element.value = '';
            element.quoted = false;
            state = 'firstchar';
        },
        comma: function(c, p, n) {
            if (element.value === undefined) {
                element.value = element.key;
                delete element.key;
            }
            container.push(element);
            element = undefined;

            if (c == '}' || c == ']')
                return pop(c);

            state = 'firstchar';
        }
    };

    return function(c, p, n) {
        if (c == '\\') {
            if (p != '\\') {
                backslash_repeat = 1;
            } else {
                backslash_repeat += 1;
            }
        }

        (actions[state])(c, p, n);

        return {
            container: container,
            state: state
        };
    };
}

var numeric_reg = /^\d+(?:\.\d+)?$/;
function combine(container, options) {
    var data = {}, is_array = null;

    container.forEach(function(element) {
        if (is_array === null) {
            is_array = element.key === undefined;

            if (is_array)
                data = [];
        }

        var value = element.value;
        if (typeof value == 'object') {
            value = combine(value, options);
        } else if (element.quoted) {
            value = unescape(value);

            if (options.numeric_check && numeric_reg.test(value))
                value = value * 1;
        } else {
            if (!options.convert_boolean_and_null){
                if (value == 't') {
                    value = true;
                } else if (value == 'f') {
                    value = false;
                } else if (value == 'NULL') {
                    value = null;
                } else if (numeric_reg.test(value)) {
                    value = value * 1;
                }
            } else{
                if (value == 'true') {
                    value = true;
                } else if (value == 'false') {
                    value = false;
                } else if (value == 'NULL') {
                    value = null;
                } else if (numeric_reg.test(value)) {
                    value = value * 1;
                }
            }
        }

        if (is_array) {
            data.push(value);
        } else {
            var key = unescape(element.key);

            data[key] = value;
        }
    });

    return data;
}

function escape(str) {
    return str.replace(new RegExp('\\\\', 'g'), "\\\\")
              .replace(new RegExp('"', 'g'), '\\"');
}

function unescape(str) {
    return str.replace(new RegExp('\\\\"', 'g'), '"')
              .replace(new RegExp('\\\\\\\\', 'g'), '\\');
}
