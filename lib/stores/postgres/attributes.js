var async = require('async');

var Store = require('../../store');

/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function(){
    this.use(function(next){
      var self = this;
      
      var table_info_sql = "SELECT a.attname, format_type(a.atttypid, a.atttypmod), pg_get_expr(d.adbin, d.adrelid), a.attnotnull, a.atttypid, a.atttypmod FROM pg_attribute a LEFT JOIN pg_attrdef d ON a.attrelid = d.adrelid AND a.attnum = d.adnum WHERE a.attrelid = '" + this.table_name + "'::regclass AND a.attnum > 0 AND NOT a.attisdropped ORDER BY a.attnum";
      var table_primary_keys_sql = "SELECT pg_attribute.attname FROM pg_index, pg_class, pg_attribute WHERE pg_class.oid = '" + this.table_name + "'::regclass AND indrelid = pg_class.oid AND pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = any(pg_index.indkey) AND indisprimary";
          
      async.parallel({
        attribs: function(callback){
          self.store.connection.raw(table_info_sql).exec(callback);
        },
        pkeys: function(callback){
          self.store.connection.raw(table_primary_keys_sql).exec(callback);
        }
      },
      function(err, results) {
        if(err){
          next();
          return self.handleException(new Error(err));
        }
                
        var result = results.attribs.rows;
        var pkeys = results.pkeys.rows.map(function(row){return row.attname});
        
        for(var i in result){
          self.attribute(result[i].attname, simplified_type(result[i].format_type), {
            persistent: true,
            primary: pkeys.indexOf(result[i].attname) !== -1,
            notnull: result[i].attnotnull == 't',
            default: extract_value_from_default(result[i].pg_get_expr)
          });
          
          if(result[i].attnotnull == 't'){
            self.validatesPresenceOf(result[i].attname);
          }
        }

        next();  
      });
    });
    
  }
}



function simplified_type(type){
  switch(type) {

    //Postgres Connector
    case type.match(/^(?:real|double precision)$/):
      return 'float';

    case 'money':
      return 'decimal';

    case type.match(/^(?:character varying|bpchar)(?:\(\d+\))?$/):
      return 'string';

    case 'bytea':
      return 'binary';

    case type.match(/^timestamp with(?:out)? time zone$/):
      return 'datetime';

    case 'interval':
      return 'string';
    
    case type.match(/^(?:point|line|lseg|box|"?path"?|polygon|circle)$/):
      return 'string';
    
    case type.match(/^(?:cidr|inet|macaddr)$/):
      return 'string';
      
    case type.match(/^bit(?: varying)?(?:\(\d+\))?$/):
      return 'string';

    case 'xml':
      return 'xml';
      
    case 'tsvector':
      return 'tsvector';

    case type.match(/^\D+\[\]$/):
      return 'string';
      
    case 'oid':
      return 'integer';

    case 'uuid':
      return 'string';

    case type.match(/^(?:small|big)int$/):
      return 'integer';

    
    //Column
    case type.match(/int/i):
      return 'integer';

    case type.match(/float|double/i):
      return 'float';
    
    case type.match(/decimal|numeric|number/i):
      return extract_scale(type) == 0 ? 'integer' : 'decimal';
    
    case 'date':
      return 'date';
        
    case type.match(/datetime/i):
      return 'datetime';
    
    case type.match(/timestamp/i):
      return 'timestamp';
    
    case type.match(/time/i):
      return 'time';
    
    case type.match(/(clob|text)/i):
      return 'text';
    
    case type.match(/(blob|binary)/i):
      return 'binary';
    
    case type.match(/(char|string)/i):
      return 'string';
    
    case type.match(/boolean/i):
      return 'boolean';
      

      
    default:
      return null;
  }
}

function extract_scale(type){
  if (type.match(/^(numeric|decimal|number)\((\d+)\)/i)){
    return 0;
  }
  if (scale = type.match(/^(numeric|decimal|number)\((\d+)(,(\d+))\)/i)){
    return parseInt(scale[4], 10);
  }
}

function extract_value_from_default(value){
  if (value === null){
    return null;
  }
  switch(value){
    // Numeric types
    case m = value.match(/\A\(?(-?\d+(\.\d*)?\)?(::bigint)?)\z/):
      return m[1];
    // Character types
    case m = value.match(/\A\(?'(.*)'::.*\b(?:character varying|bpchar|text)\z/m):
      return m[1];
    // Binary data types
    case m = value.match(/\A'(.*)'::bytea\z/m):
      return m[1];
    // Date/time types
    case m = value.match(/\A'(.+)'::(?:time(?:stamp)? with(?:out)? time zone|date)\z/):
      return m[1];
    case m = value.match(/\A'(.*)'::interval\z/):
      return m[1];
    // Boolean type
    case 'true':
      return true;
    case 'false':
      return false;
    // Geometric types
    case m = value.match(/\A'(.*)'::(?:point|line|lseg|box|"?path"?|polygon|circle)\z/):
      return m[1];
    // Network address types
    case m = value.match(/\A'(.*)'::(?:cidr|inet|macaddr)\z/):
      return m[1];
    // Bit string types
    case m = value.match(/\AB'(.*)'::"?bit(?: varying)?"?\z/):
      return m[1];
    // XML type
    case m = value.match(/\A'(.*)'::xml\z/m):
      return m[1];
    // Arrays
    case m = value.match(/\A'(.*)'::"?\D+"?\[\]\z/):
      return m[1];
    // Object identifier types
    case m = value.match(/\A-?\d+\z/):
      return m[1];
    default:
      return null
  }     
}


