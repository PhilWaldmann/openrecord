var ldap = require('ldapjs')

exports.store = {
  mixinCallback: function(){
    // the GUID will be converted by ldapjs
    ldap.Attribute.settings.guid_format = ldap.GUID_FORMAT_D

    this.addType('guid', {
      read: function(value){
        return value
      },

      write: function(value){
        if(!value) return null

        value = value.replace(/(.{2})(.{2})(.{2})(.{2})-(.{2})(.{2})-(.{2})(.{2})-(.{2})(.{2})-(.{12})/, '$4$3$2$1$6$5$8$7$9$10$11')

        if(Buffer.from) return Buffer.from(value, 'hex')
        return new Buffer(value, 'hex') // eslint-disable-line node/no-deprecated-api
        // return value; //not yet supported by ldapjs
        // return '\\' + value.toString('hex').match(/.{2}/g).join('\\')
      }

    }, {
      operators: {
        default: 'eq',

        'eq': function(attr, value, options){
          value = this.definition.cast(attr, value, 'write')
          options.filter.filters.push(new ldap.EqualityFilter({ attribute: attr, value: value }))
        }

      }
    })
  }
}
