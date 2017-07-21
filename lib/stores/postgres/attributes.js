var async = require('async')

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      var self = this

      // thanks for ActiveRecord
      var tableInfoSql = "SELECT a.attname, format_type(a.atttypid, a.atttypmod), pg_get_expr(d.adbin, d.adrelid), a.attnotnull, a.atttypid, a.atttypmod FROM pg_attribute a LEFT JOIN pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum WHERE a.attrelid = '" + this.table_name + "'::regclass AND a.attnum > 0 AND NOT a.attisdropped ORDER BY a.attnum"
      var tablePrimaryKeysSql = "SELECT pg_attribute.attname FROM pg_index, pg_class, pg_attribute WHERE pg_class.oid = '" + this.table_name + "'::regclass AND indrelid = pg_class.oid AND pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = any(pg_index.indkey) AND indisprimary"

      async.parallel({
        attribs: function(callback){
          self.store.connection.raw(tableInfoSql).asCallback(callback)
        },
        pkeys: function(callback){
          self.store.connection.raw(tablePrimaryKeysSql).asCallback(callback)
        }
      },
      function(err, results) {
        if(err){
          next()
          return self.store.handleException(err)
        }

        var result = results.attribs.rows
        var pkeys = results.pkeys.rows.map(function(row){ return row.attname })

        for(var i in result){
          var name = result[i].attname
          var type = simplifiedType(result[i].format_type, name, self)
          var hasDefaultValue = !!result[i].pg_get_expr // ? result[i].pg_get_expr.match(/nextval\(.+\)/) : false;
          var primary = pkeys.indexOf(result[i].attname) !== -1

          self.attribute(name, type, {
            persistent: true,
            primary: primary,
            notnull: result[i].attnotnull,
            default: extractValueFromDefault(result[i].pg_get_expr),
            writable: !(primary && hasDefaultValue) // set to false if primary with default value
          })

          if(result[i].attnotnull && !hasDefaultValue){
            self.validatesPresenceOf(result[i].attname)
          }
        }

        next()
      })
    }, 80)
  }
}


function simplifiedType(type, name, def){
  switch(type) {
    case 'int':
    case 'integer':
    case 'small int':
    case 'big int':
    case 'oid':
      return 'integer'

    case 'int[]':
    case 'integer[]':
    case 'small int[]':
    case 'big int[]':
    case 'oid[]':
      return 'integer_array'


    case 'money':
    case 'real':
    case 'double precision':
    case 'float':
    case 'double':
    case 'numeric':
    case 'decimal':
    case 'number':
      return 'float'

    case 'money[]':
    case 'real[]':
    case 'double precision[]':
    case 'float[]':
    case 'double[]':
    case 'numeric[]':
    case 'decimal[]':
    case 'number[]':
      return 'float_array'


    case 'bytea':
    case 'blob':
    case 'binary':
      return 'binary'


    case 'hstore':
      return 'hstore'


    case 'boolean':
      return 'boolean'

    case 'boolean[]':
      return 'boolean_array'


    case 'date':
      return 'date'

    case 'date[]':
      return 'date_array'


    case 'timestamp':
    case 'timestamp with time zone':
    case 'timestamp without time zone':
      return 'datetime'

    case 'timestamp[]':
    case 'timestamp with time zone[]':
    case 'timestamp without time zone[]':
      return 'datetime_array'


    case 'time':
    case 'time without time zone':
    case 'time with time zone':
      return 'time'

    case 'time[]':
    case 'time without time zone[]':
    case 'time with time zone[]':
      return 'time_array'

    case 'json':
    case 'jsonb':
      return 'json'


    default:
      var len = type.match(/\((.+)\)/)
      if(len){
        len = parseInt(len[1])

        if(len > 1){
          def.validatesLengthOf(name, len)
        }
      }
      if(type.match(/.+\[\]$/)){
        return 'string_array'
      }

      return 'string'
  }
}



function extractValueFromDefault(value){
  if (value === null || value.match(/uuid_generate/)){
    return null
  }
  var m

  m = value.match(/\(?(-?\d+(\.\d*)?\)?(::bigint)?)/)
  if (m) return m[1]

  m = value.match(/\(?'(.*)'::.*\b(?:character varying|bpchar|text)/m)
  if (m) return m[1]

  m = value.match(/'(.*)'::bytea/m)
  if (m) return m[1]

  m = value.match(/'(.+)'::(?:time(?:stamp)? with(?:out)? time zone|date)/)
  if(m) return m[1]

  m = value.match(/'(.*)'::interval/)
  if(m) return m[1]

  m = value === 'true'
  if(m) return true

  m = value === 'false'
  if(m) return false

  m = value.match(/'(.*)'::(?:point|line|lseg|box|"?path"?|polygon|circle)/)
  if(m) return m[1]

  m = value.match(/'(.*)'::(?:cidr|inet|macaddr)/)
  if(m) return m[1]

  m = value.match(/'(.*)'::"?bit(?: varying)?"?/)
  if(m) return m[1]

  m = value.match(/'(.*)'::xml/m)
  if(m) return m[1]

  m = value.match(/'(.*)'::"?\D+"?\[\]/)
  if(m) return m[1]

  m = value.match(/-?\d+/)
  if(m) return m[1]

  return null
}
