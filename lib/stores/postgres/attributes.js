const path = require('path')
const Promise = require('bluebird')
const Definition = require('../../definition')

const TYPES = {
  'int': 'integer',
  'integer': 'integer',
  'small int': 'integer',
  'big int': 'integer',
  'oid': 'integer',

  'money': 'float',
  'real': 'float',
  'double precision': 'float',
  'float': 'float',
  'double': 'float',
  'numeric': 'float',
  'decimal': 'float',
  'number': 'float',

  'bytea': 'binary',
  'blob': 'binary',
  'binary': 'binary',

  'hstore': 'hstore',

  'boolean': 'boolean',

  'date': 'date',

  'timestamp': 'datetime',
  'timestamp with time zone': 'datetime',
  'timestamp without time zone': 'datetime',

  'time': 'time',
  'time without time zone': 'time',
  'time with time zone': 'time',

  'json': 'json',
  'jsonb': 'json',

  'uuid': 'uuid',

  'text': 'string',
  'varchar': 'string',
  'character varying': 'string',
  'char': 'string',
  'character': 'string'
}

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      var self = this

      this.store.getTypeAttributes(this.table_name).then(function(attributes){
        attributes.forEach(function(attr){
          self.attribute(attr.name, attr.type, attr.options)
          attr.validations.forEach(function(validation){
            self[validation.name].apply(self, [attr.name].concat(validation.args))
          })
        })

        next()
      }).catch(function(error){
        next()
        return self.store.handleException(error)
      })
    }, 80)
  }
}



exports.store = {
  getTypeAttributes(name){
    var self = this
    var tableInfoSql = [
      'SELECT a.attname, format_type(a.atttypid, a.atttypmod), pg_get_expr(d.adbin, d.adrelid), a.attnotnull, a.atttypid, t.typoutput, t.typanalyze, c.description',
      'FROM pg_attribute a',
      'LEFT JOIN pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum',
      'LEFT JOIN pg_type t ON a.atttypid = t.oid',
      'LEFT JOIN pg_description c ON a.attrelid = c.objoid AND a.attnum = c.objsubid',
      "WHERE a.attrelid = '" + name + "'::regclass AND a.attnum > 0 AND NOT a.attisdropped",
      'ORDER BY a.attnum'
    ].join(' ')
    var tablePrimaryKeysSql = "SELECT pg_attribute.attname FROM pg_index, pg_class, pg_attribute WHERE pg_class.oid = '" + name + "'::regclass AND indrelid = pg_class.oid AND pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = any(pg_index.indkey) AND indisprimary"

    return Promise.join(
      self.connection.raw(tableInfoSql),
      self.connection.raw(tablePrimaryKeysSql)
    ).spread(function(result, pkeys){
      result = result.rows
      pkeys = pkeys.rows.map(function(r){
        return r.attname
      })

      return Promise.all(
        result.map(function(attribute){
          var type = simplifiedType(attribute.format_type)
          var primary = pkeys.indexOf(attribute.attname) !== -1
          var hasDefaultValue = !!attribute.pg_get_expr
          var attrDef = {
            name: attribute.attname,
            type: type,
            options: {
              description: attribute.description,
              persistent: true,
              primary: primary,
              notnull: attribute.attnotnull,
              default: extractValueFromDefault(attribute.pg_get_expr),
              writable: !(primary && hasDefaultValue) // set to false if primary with default value
            },
            validations: extractValidations(attribute)
          }


          // IF CUSTOM TYPE!
          if(!type){
            if(attribute.typoutput === 'enum_out'){
              // get enum types
              return self.connection.raw('select enumlabel from pg_enum where enumtypid = ? ORDER BY enumsortorder', attribute.atttypid).then(function(enums){
                var values = enums.rows.map(function(r){
                  return r.enumlabel
                })

                attrDef.type = 'string'
                attrDef.validations.push({name: 'validatesInclusionOf', args: [values]})

                return attrDef
              })
            }

            // set to composite type
            var typeName = attribute.format_type
            attrDef.type = 'composite'
            // and load the type
            return self.getTypeAttributes(typeName).then(function(attributes){
              // and now we create a new definition (like a model, but without all the save stuff)
              var definition = new Definition(self, typeName)

              // include only important parts
              definition.include([
                path.join(__dirname, '..', '..', 'base', '*.js'),
                path.join(__dirname, '..', '..', 'persistence', '*.js'),
                path.join(__dirname, '..', '..', 'persistence', 'convert.js'),
                path.join(__dirname, '..', '..', 'persistence', 'data_types.js'),
                path.join(__dirname, '..', '..', 'persistence', 'utils.js'),
                path.join(__dirname, '..', '..', 'stores', 'sql', 'data_types', '*'),
                path.join(__dirname, '..', '..', 'stores', 'sql', 'utils.js')
              ])

              // add attributes and validations
              definition.use(function(){
                var def = this

                attributes.forEach(function(attr){
                  def.attribute(attr.name, attr.type, attr.options)
                  attr.validations.forEach(function(validation){
                    def[validation.name].apply(self, [attr.name].concat(validation.args))
                  })
                })
              })

              // add custom validation to call composite type validation
              attrDef.validations.push({name: 'validates',
                args: [
                  function(done){
                    var parent = this
                    if(this[attrDef.name] && typeof this[attrDef.name].isValid === 'function'){
                      this[attrDef.name].isValid(function(valid){
                        if(!valid){
                          Object.keys(this.errors).forEach(function(field){
                            this.errors[field].forEach(function(error){
                              parent.errors.add(attrDef.name + '.' + field, error)
                            }, this)
                          }, this)
                        }
                        return done(valid)
                      })
                    }
                  }
                ]})

              return new Promise(function(resolve, reject){
                definition.define(function(Model){
                  attrDef.options.Type = Model
                  attrDef.options.use = Model.definition.use.bind(Model.definition)
                  attrDef.options.attributes = attributes.map(function(a){
                    return a.name
                  })
                  resolve(attrDef)
                })
              })
            })
          }

          return Promise.resolve(attrDef)
        })
      )
    })
  }
}


function simplifiedType(type, attribute){
  type = type.replace(/\((.+)\)/, '')
  var array = !!type.match(/.+\[\]$/)
  type = type.replace(/\[\]$/, '')

  var simpleType = TYPES[type]
  if(!simpleType){
    return null
  }

  if(array) return simpleType + '_array'
  return simpleType
}


function extractValidations(attribute){
  var validations = []

  // max length validation
  var len = attribute.format_type.match(/\((.+)\)/)
  if(len){
    len = parseInt(len[1])

    if(len > 1){
      validations.push({name: 'validatesLengthOf', args: [len]})
    }
  }

  // not null
  if(attribute.attnotnull && !attribute.pg_get_expr){
    validations.push({name: 'validatesPresenceOf', args: []})
  }

  return validations
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
