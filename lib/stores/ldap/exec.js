const debug = require('debug')('openrecord:exec')
const ldap = require('ldapjs')

exports.definition = {
  mixinCallback: function() {
    var self = this

    this.onFind(function(options, data) {
      var chain = this

      if (
        options.filter &&
        options.filter.filters &&
        options.filter.filters.length === 0
      ) {
        options.filter = null
      }

      options.controls = options.controls || []

      for (var i = 0; i < options.controls.length; i++) {
        if (!(options.controls[i] instanceof ldap.Control)) {
          options.controls[i] = new ldap.Control(options.controls[i])
        }
      }

      return new Promise(function(resolve, reject) {
        chain.connection.search(
          options.root,
          options,
          options.controls,
          function(err, res) {
            debug(
              'Search ' +
                options.root +
                ' (Scope=' +
                options.scope +
                ', Filter=' +
                options.filter.toString() +
                ', Attributes=' +
                options.attributes
            )

            if (err) return reject(err)

            var records = []
            var rangeChecks = 0

            // get search resutls
            res.on('searchEntry', function(entry) {
              rangeChecks++
              var obj = entry.object
              chain.checkRangeAttributes(entry, obj, function(error) {
                if (error) return reject(error)
                records.push(self.store.utils.mergeBinary(chain, entry, obj))
                rangeChecks--
                if (rangeChecks === 0) finished()
              })
            })

            var done = false
            var finished = function() {
              if (done && rangeChecks === 0) {
                data.result = records
                resolve()
              }
            }

            // finished search...
            res.on('end', function() {
              done = true
              finished()
            })

            res.on('error', function(err) {
              if (err instanceof ldap.NoSuchObjectError) {
                return resolve() // if no object was found, it's an empty result
              }
              reject(err)
            })
          }
        )
      })
    })
  }
}

/*
 * MODEL
 */
exports.model = {
  getExecOptions: function() {
    return {
      filter: new ldap.AndFilter({ filters: [] })
    }
  },

  checkRangeAttributes: function(entry, target, callback) {
    var self = this
    var obj = entry.object
    var keys = Object.keys(obj)
    var ranges = []

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var range = key.match(/(.+);range=(\d+)-(.+)?$/i)

      if (range) {
        var attr = range[1]
        var low = parseInt(range[2])
        var high = parseInt(range[3]) || null

        // add values to original attribute
        target[attr] = target[attr] || []
        target[attr] = target[attr].concat(obj[key])

        if (high != null && high !== low) {
          var tmp = low
          low = high + 1
          high = high + (high - tmp) + 1

          ranges.push(attr + ';range=' + low + '-' + (high || '*'))
        }
      }
    }

    if (ranges.length === 0) return callback()

    this.connection.search(obj.dn, { attributes: ranges }, [], function(
      error,
      res
    ) {
      if (error) return callback(error)

      // get search results
      res.on('searchEntry', function(entry) {
        self.checkRangeAttributes(entry, target, callback)
      })

      res.on('error', function(error) {
        callback(error)
      })
    })
  }
}
