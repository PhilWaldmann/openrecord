const Definition = require('../../definition')

const TYPES = {
  int: 'integer',
  integer: 'integer',
  smallint: 'integer',
  bigint: 'integer',
  oid: 'integer',
  smallserial: 'integer',
  serial: 'integer',
  bigserial: 'integer',

  money: 'float',
  real: 'float',
  'double precision': 'float',
  float: 'float',
  double: 'float',
  numeric: 'float',
  decimal: 'float',
  number: 'float',

  bytea: 'binary',
  blob: 'binary',
  binary: 'binary',

  hstore: 'hstore',
  tsvector: 'tsvector',

  boolean: 'boolean',

  date: 'date',

  timestamp: 'datetime',
  'timestamp with time zone': 'datetime',
  'timestamp without time zone': 'datetime',

  time: 'time',
  'time without time zone': 'time',
  'time with time zone': 'time',

  interval: 'interval',

  json: 'json',
  jsonb: 'json',

  uuid: 'uuid',

  text: 'string',
  varchar: 'string',
  'character varying': 'string',
  char: 'string',
  character: 'string',

  point: 'point',
  line: 'line',
  lseg: 'path',
  box: 'box',
  path: 'path',
  polygon: 'polygon',
  circle: 'circle'
}

/*
 * DEFINITION
 */
exports.definition = {
  setTableAttributes: function(attributes) {
    var self = this

    return self.store.utils.series(
      attributes.map(function(attr) {
        return function() {
          self.attribute(attr.name, attr.type, attr.options)
          attr.validations.forEach(function(validation) {
            self[validation.name].apply(
              self,
              [attr.name].concat(validation.args)
            )
          })

          if (attr.type === 'composite') {
            // add custom validation to call composite type validation
            self.validates(function() {
              var parent = this
              var child = this[attr.name]
              if (
                parent[attr.name] &&
                typeof parent[attr.name].isValid === 'function'
              ) {
                return child.isValid(function(valid) {
                  if (!valid) {
                    child.errors.each(function(field, error) {
                      parent.errors.add(attr.name + '.' + field, error)
                    })

                    throw parent.errors
                  }
                })
              }
            })

            // create a new "trimmed" model for the composite type
            return self.createCompositeType(
              attr.type_name,
              attr.type_attributes,
              attr
            )
          }
        }
      })
    )
  },

  createCompositeType: function(name, attributes, attr) {
    var store = this.store

    var setAttrOptions = function(Model) {
      store.dynamicAttributeTypes[name] = Model
      attr.options.dynamicType = Model
      attr.options.default = attr.options.default || {}
      attr.options.use = function(fn) {
        return fn.call(Model.definition)
      }
      attr.options.attributes = attributes.map(function(a) {
        return a.name
      })
    }

    if (store.dynamicAttributeTypes[name]) {
      // is shared between all attributes with the same type
      var Model = store.dynamicAttributeTypes[name]
      return setAttrOptions(Model)
    }

    // create a new definition (like a model, but without all the save stuff)
    var definition = new Definition(store, name)

    // disable cache, because the parent model will cach it via it's attributes...
    definition.cacheDisabled = true

    // include only important parts
    definition.include(
      require('../../base').concat(
        require('../../stores/sql/data_types'),
        require('../../stores/sql/utils'),
        require('../../stores/postgres/attributes'),
        require('../../stores/postgres/data_types')
      )
    )

    // add attributes and validations
    definition.use(function() {
      return this.setTableAttributes(attributes)
    })

    return definition.define().then(function(result) {
      setAttrOptions(result.Model)
    })
  }
}

exports.store = {
  loadTableAttributes: function(name) {
    var self = this
    var tableInfoSql = [
      'SELECT a.attname, format_type(a.atttypid, a.atttypmod), pg_get_expr(d.adbin, d.adrelid), a.attnotnull, a.atttypid, t.typoutput, t.typanalyze, c.description',
      'FROM pg_attribute a',
      'LEFT JOIN pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum',
      'LEFT JOIN pg_type t ON a.atttypid = t.oid',
      'LEFT JOIN pg_description c ON a.attrelid = c.objoid AND a.attnum = c.objsubid',
      "WHERE a.attrelid = '" +
        name +
        "'::regclass AND a.attnum > 0 AND NOT a.attisdropped",
      'ORDER BY a.attnum'
    ].join(' ')
    var tablePrimaryKeysSql =
      "SELECT pg_attribute.attname FROM pg_index, pg_class, pg_attribute WHERE pg_class.oid = '" +
      name +
      "'::regclass AND indrelid = pg_class.oid AND pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = any(pg_index.indkey) AND indisprimary"

    return Promise.all([
      self.connection.raw(tableInfoSql),
      self.connection.raw(tablePrimaryKeysSql)
    ]).then(function(data) {
      const result = data[0].rows
      const pkeys = data[1].rows.map(function(r) {
        return r.attname
      })

      return Promise.all(
        result.map(function(attribute) {
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
              length: getMaxLength(attribute.format_type),
              writable: !(primary && hasDefaultValue) // set to false if primary with default value
            },
            validations: extractValidations(attribute)
          }

          // IF CUSTOM TYPE!
          if (!type) {
            if (attribute.typoutput === 'enum_out') {
              // get enum types
              return self.connection
                .raw(
                  'select enumlabel from pg_enum where enumtypid = ? ORDER BY enumsortorder',
                  attribute.atttypid
                )
                .then(function(enums) {
                  var values = enums.rows.map(function(r) {
                    return r.enumlabel
                  })

                  attrDef.type = 'string'
                  attrDef.validations.push({
                    name: 'validatesInclusionOf',
                    args: [values]
                  })

                  return attrDef
                })
            }

            // set to composite type
            var typeName = attribute.format_type
            attrDef.type = 'composite'
            // and load the type

            return self
              .loadTableAttributes(typeName)
              .then(function(attributes) {
                attrDef.type_name = typeName
                attrDef.type_attributes = attributes
                return attrDef
              })
              .catch(function() {
                // ignore error and use default type `string`
                attrDef.type = 'string'
                return attrDef
              })
          }

          return Promise.resolve(attrDef)
        })
      )
    })
  }
}

function getMaxLength(type) {
  var len = type.match(/\((\d+)\)/)
  if (len) {
    len = parseInt(len[1])

    if (len > 1) {
      return len
    }
  }
  return null
}

function simplifiedType(type, attribute) {
  type = type.replace(/\((.+)\)/, '')
  var array = !!type.match(/.+\[\]$/)
  type = type.replace(/\[\]$/, '')

  var simpleType = TYPES[type]
  if (!simpleType) {
    return null
  }

  if (array) return simpleType + '_array'
  return simpleType
}

function extractValidations(attribute) {
  var validations = []

  // max length validation
  var len = getMaxLength(attribute.format_type)
  if (len) {
    validations.push({ name: 'validatesLengthOf', args: [len] })
  }

  // not null
  if (attribute.attnotnull && !attribute.pg_get_expr) {
    validations.push({ name: 'validatesPresenceOf', args: [] })
  }

  return validations
}

function extractValueFromDefault(value) {
  if (value === null || value.match(/uuid_generate/)) {
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
  if (m) return m[1]

  m = value.match(/'(.*)'::interval/)
  if (m) return m[1]

  m = value === 'true'
  if (m) return true

  m = value === 'false'
  if (m) return false

  m = value.match(/'(.*)'::(?:point|line|lseg|box|"?path"?|polygon|circle)/)
  if (m) return m[1]

  m = value.match(/'(.*)'::(?:cidr|inet|macaddr)/)
  if (m) return m[1]

  m = value.match(/'(.*)'::"?bit(?: varying)?"?/)
  if (m) return m[1]

  m = value.match(/'(.*)'::xml/m)
  if (m) return m[1]

  m = value.match(/'(.*)'::"?\D+"?\[\]/)
  if (m) return m[1]

  m = value.match(/-?\d+/)
  if (m) return m[1]

  return null
}
