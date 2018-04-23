exports.utils = {
  toJoinsList: function(joins) {
    const list = []
    if (!joins) return list
    if (!Array.isArray(joins)) joins = [joins]

    // join could be called with `.join("RAW JOIN...", [attrs])` or via `.join(["RAW JOIN...", [attrs]])`
    // here it will be normalized to the first form!
    if (joins.length === 1 && Array.isArray(joins[0]))
      return this.toJoinsList(joins[0])

    // raw condition
    if (typeof joins[0] === 'string' && joins[0].match(/join /i)) {
      var query = joins[0]
      var args = joins.slice(1)

      if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
        // if we got e.g. ["login = :login", {login:"phil"}]
        var values = args[0]
        args = []
        query = query.replace(/:(\w+)/g, function(res, field) {
          args.push(values[field])
          return '?' // use a questionmark as a placeholder...
        })
      }

      if (args.length === 1 && Array.isArray(args[0])) args = args[0] // flatten one level

      list.push({
        type: 'raw',
        query: query,
        args: args
      })

      return list
    }

    return this.toIncludesList(joins) // joins and includes use the same format!
  },

  getAttributeColumns: function(
    definition,
    joinMapping,
    parentRelations,
    isRoot
  ) {
    const self = this
    const columns = []
    var attributeMapping = joinMapping.attributes

    // build mapping for NestHydrationJS
    if (!isRoot) {
      const currentName = parentRelations.slice(-1)
      const parentNames = parentRelations.slice(0, -1)
      parentNames.forEach(function(name) {
        attributeMapping = attributeMapping[name]
      })
      attributeMapping[currentName] = {}
      attributeMapping = attributeMapping[currentName]
    }

    // add primary keys for hydration
    attributeMapping.$primary = definition.primaryKeys

    Object.keys(definition.attributes).forEach(function(key) {
      const attrDefinition = definition.attributes[key]
      if (attrDefinition.persistent) {
        const tmp = {}
        const index = 'f' + joinMapping.selectIndex++
        tmp[index] = self.toAttributeName(key, parentRelations)

        // add hydration attribute mapping
        attributeMapping[key] = index

        columns.push(tmp)
      }
    })

    return columns
  },

  toAttributeName: function(attribute, parentNames) {
    return this.toTableName(parentNames) + '.' + attribute
  },

  toTableName: function(parentNames) {
    var table = parentNames[0]

    if (parentNames.length > 1) {
      if (parentNames.length === 1) {
        table = parentNames[0]
      }

      if (parentNames.length === 2) {
        table = parentNames[0] + '_' + parentNames[1]
      }

      if (parentNames.length > 2) {
        var l = parentNames.length
        table = parentNames[l - 2] + '_' + parentNames[l - 1]
      }
    }

    return table
  },

  hydrateJoinResult: function(data, columns, mapping) {
    mapping = mapping || {}

    const self = this
    const records = []
    const columnNames = Object.keys(columns).filter(function(c) {
      return c !== '$primary'
    })
    const primaryColumns = columns.$primary || [] // $primary === the primary keys for grouping records
    const baseColumns = columnNames.filter(function(c) {
      return typeof columns[c] === 'string'
    })
    const relationColumns = columnNames.filter(function(c) {
      return typeof columns[c] !== 'string'
    })

    if (columnNames.length === 0) return records

    relationColumns.forEach(function(name) {
      mapping[name] = mapping[name] || {}
    })

    data.forEach(function(item) {
      // generate key with primary keys
      const keyParts = primaryColumns
        .map(function(c) {
          return item[columns[c]]
        })
        .filter(function(v) {
          return v !== null
        })
      if (keyParts.length === 0) return

      const key = keyParts.join('-')
      var record

      // check if record was already found
      if (mapping[key]) {
        record = mapping[key]
      } else {
        record = {}

        // if not, convert columns to attributes
        baseColumns.forEach(function(column) {
          record[column] = item[columns[column]]
        })

        // add to mapping and result
        mapping[key] = record
      }

      records.push(record)

      // now check relational columns
      relationColumns.forEach(function(name) {
        const childRecords = self.hydrateJoinResult(
          [item],
          columns[name],
          mapping[name]
        )
        record[name] = self.uniq((record[name] || []).concat(childRecords))
      })
    })

    return self.uniq(records)
  }
}
