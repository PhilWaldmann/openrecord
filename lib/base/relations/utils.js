exports.utils = {
  recordsToConditions: function(records, from, to) {
    const self = this
    if (!records || !Array.isArray(records)) return false
    if (from.length === 0 || to.length === 0 || records.length === 0)
      return false
    const conditions = {}
    var found = 0

    from.forEach(function(key, index) {
      const opposite = to[index]
      var keyFound = false
      conditions[opposite] = conditions[opposite] || []

      records.forEach(function(parent) {
        if (parent[key]) {
          keyFound = true
          conditions[opposite].push(parent[key])
        }
      })

      if (keyFound) found++

      // flatten array + uniq + sort
      conditions[opposite] = self
        .uniq(self.flatten(conditions[opposite]))
        .sort()
    })

    if (found !== from.length) return false
    return conditions
  },

  parentConditionsToConditions: function(parentConditions, from, to) {
    const self = this
    const conditions = {}
    var found = false

    from.forEach(function(key, index) {
      const opposite = to[index]
      var keyFound = false
      conditions[opposite] = conditions[opposite] || []

      parentConditions.forEach(function(cond) {
        if (cond.type === 'hash') {
          const attr = cond.attribute.replace(/^.*\./, '') // remove first part befor a `.` - in case it's sql tablename.fieldname
          if (
            attr === key &&
            cond.operator === 'eq' &&
            !(cond.value && cond.value.$attribute)
          ) {
            keyFound = true
            conditions[opposite].push(cond.value)
          }
        }
      })

      if (keyFound) found++

      // flatten array + uniq + sort
      conditions[opposite] = self
        .uniq(self.flatten(conditions[opposite]))
        .sort()
    })

    if (found !== from.length) return false
    return conditions
  },

  checkFieldEquality: function(val1, val2) {
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return val1.sort().toString() === val2.sort().toString()
    }

    if (Array.isArray(val1) && !Array.isArray(val2)) {
      return val1.indexOf(val2) !== -1
    }

    if (!Array.isArray(val1) && Array.isArray(val2)) {
      return val2.indexOf(val1) !== -1
    }

    return val1 === val2
  },

  distinctRecords: function(recordsA, recordsB, keys) {
    return recordsA.filter(function(recordA) {
      var match = false
      keys.forEach(function(key) {
        recordsB.forEach(function(recordB) {
          const valA = recordA[key]
          var valB = recordB[key]

          if (typeof recordB !== 'object') valB = recordB
          if (exports.utils.checkFieldEquality(valA, valB)) match = true
        })
      })

      return !match
    })
  }
}
