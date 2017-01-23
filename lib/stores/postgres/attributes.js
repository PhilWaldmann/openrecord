var async = require('async');

var Store = require('../../store');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      var self = this;

      //thanks for ActiveRecord
      var table_info_sql = "SELECT a.attname, format_type(a.atttypid, a.atttypmod), pg_get_expr(d.adbin, d.adrelid), a.attnotnull, a.atttypid, a.atttypmod FROM pg_attribute a LEFT JOIN pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum WHERE a.attrelid = '" + this.table_name + "'::regclass AND a.attnum > 0 AND NOT a.attisdropped ORDER BY a.attnum";
      var table_primary_keys_sql = "SELECT pg_attribute.attname FROM pg_index, pg_class, pg_attribute WHERE pg_class.oid = '" + this.table_name + "'::regclass AND indrelid = pg_class.oid AND pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = any(pg_index.indkey) AND indisprimary";

      async.parallel({
        attribs: function(callback){
          self.store.connection.raw(table_info_sql).asCallback(callback);
        },
        pkeys: function(callback){
          self.store.connection.raw(table_primary_keys_sql).asCallback(callback);
        }
      },
      function(err, results) {
        if(err){
          next();
          return self.store.handleException(err);
        }

        var result = results.attribs.rows;
        var pkeys = results.pkeys.rows.map(function(row){return row.attname});

        for(var i in result){
          var name = result[i].attname;
          var type = simplified_type(result[i].format_type, name, self)
          var serial = result[i].pg_get_expr ? result[i].pg_get_expr.match(/nextval\(.+\)/) : false;


          self.attribute(name, type, {
            persistent: true,
            primary: pkeys.indexOf(result[i].attname) !== -1,
            notnull: result[i].attnotnull,
            default: extract_value_from_default(result[i].pg_get_expr),
            writable: !serial //set to false if serial
          });

          if(result[i].attnotnull && !serial){
            self.validatesPresenceOf(result[i].attname);
          }
        }

        next();
      });
    }, 80);

  }
}


function simplified_type(type, name, def){
  switch(type) {
    case 'int':
    case 'integer':
    case 'small int':
    case 'big int':
    case 'oid':
      return 'integer';

    case 'int[]':
    case 'integer[]':
    case 'small int[]':
    case 'big int[]':
    case 'oid[]':
      return 'integer_array';


    case 'money':
    case 'real':
    case 'double precision':
    case 'float':
    case 'double':
    case 'numeric':
    case 'decimal':
    case 'number':
      return 'float';

    case 'money[]':
    case 'real[]':
    case 'double precision[]':
    case 'float[]':
    case 'double[]':
    case 'numeric[]':
    case 'decimal[]':
    case 'number[]':
      return 'float_array';


    case 'bytea':
    case 'blob':
    case 'binary':
      return 'binary';


    case 'hstore':
      return 'hstore';


    case 'boolean':
      return 'boolean';

    case 'boolean[]':
      return 'boolean_array';


    case 'date':
      return 'date';

    case 'date[]':
      return 'date_array';


    case 'timestamp':
    case 'timestamp with time zone':
    case 'timestamp without time zone':
      return 'datetime';

    case 'timestamp[]':
    case 'timestamp with time zone[]':
    case 'timestamp without time zone[]':
      return 'datetime_array';


    case 'time':
    case 'time without time zone':
    case 'time with time zone':
      return 'time';

    case 'time[]':
    case 'time without time zone[]':
    case 'time with time zone[]':
      return 'time_array';


    default:
      var len = type.match(/\((.+)\)/);
      if(len){
        len = parseInt(len[1]);

        if(len > 1){
          def.validatesLengthOf(name, len);
        }
      }
      if(type.match(/.+\[\]$/)){
        return 'string_array';
      }

      return 'string';
  }
}



function extract_value_from_default(value){
  if (value === null){
    return null;
  }
  if (m = value.match(/\A\(?(-?\d+(\.\d*)?\)?(::bigint)?)\z/)){
    return m[1];
  } else if (m = value.match(/\A\(?'(.*)'::.*\b(?:character varying|bpchar|text)\z/m)){
    return m[1];
  } else if (m = value.match(/\A'(.*)'::bytea\z/m)){
    return m[1];
  } else if (m = value.match(/\A'(.+)'::(?:time(?:stamp)? with(?:out)? time zone|date)\z/)){
    return m[1];
  } else if (m = value.match(/\A'(.*)'::interval\z/)){
    return m[1];
  } else if (value == 'true'){
    return true;
  } else if (value == 'false'){
    return false;
  } else if (m = value.match(/\A'(.*)'::(?:point|line|lseg|box|"?path"?|polygon|circle)\z/)){
    return m[1];
  } else if (m = value.match(/\A'(.*)'::(?:cidr|inet|macaddr)\z/)){
    return m[1];
  } else if (m = value.match(/\AB'(.*)'::"?bit(?: varying)?"?\z/)){
    return m[1];
  } else if (m = value.match(/\A'(.*)'::xml\z/m)){
    return m[1];
  } else if (m = value.match(/\A'(.*)'::"?\D+"?\[\]\z/)){
    return m[1];
  } else if (m = value.match(/\A-?\d+\z/)){
    return m[1];
  } else {
    return null;
  }
}
