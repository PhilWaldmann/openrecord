const debug = require('debug')('openrecord:nested_set')

exports.migration = {
  nestedSet: function() {
    this.integer('lft')
    this.integer('rgt')
    this.integer('depth')
    this.integer('parent_id', { default: 0 })
  }
}

exports.definition = {
  nestedSet: function() {
    var self = this

    this.attribute('leaf', Boolean, {
      writable: false,
      default: true
    })

    this.hasMany('children', { model: this.getName(), to: 'parent_id' })
    this.belongsTo('parent', { model: this.getName() })

    this.scope('byLevel', function(level) {
      this.where({ depth: level })
    })

    this.scope('rootOnly', function() {
      this.byLevel(0)
    })

    this.scope('withChildren', function() {
      this.include('children')
    })

    this.scope('withAllChildren', function(depth) {
      if (depth === 1) {
        this.withChildren()
      } else {
        this.setInternal('nested_set_with_children_depth', depth)
        this.setInternal('nested_set_with_children', true)
      }
    })

    // helper for withAllChildren
    // TODO: should be replaced with new relations config/bulk loading
    this.afterFind(function(data) {
      var withChildren = this.getInternal('nested_set_with_children')
      var depth = this.getInternal('nested_set_with_children_depth')
      var records = data.result || []
      var record
      var i

      if (!Array.isArray(records)) records = [records]

      // set leaf attribute
      for (i = 0; i < records.length; i++) {
        record = records[i]
        if (record.lft !== record.rgt - 1) {
          record.leaf = false
        }
      }

      if (withChildren) {
        if (records && !Array.isArray(records)) records = [records]

        var ranges = []
        var rangeRecords = {}

        // loop over records and get it's ranges
        for (i = 0; i < records.length; i++) {
          record = records[i]

          if (record.rgt - record.lft > 1) {
            ranges.push([record.lft + 1, record.rgt - 1])
            rangeRecords[record.lft] = record
          }
        }

        if (ranges.length > 0) {
          var depthConditions = null

          if (depth) depthConditions = { depth_lte: depth }

          // find all records within that ranges
          return this.model
            .where({ lft_between: ranges })
            .where(depthConditions)
            .order('lft')
            .exec(function(children) {
              for (var i = 0; i < children.length; i++) {
                var child = children[i]

                // add all child records to the associated parents. based on lft and rgt
                if (rangeRecords[child.lft - 1]) {
                  var parent = rangeRecords[child.lft - 1]
                  if (parent) {
                    parent.relations.children =
                      parent.relations.children ||
                      parent.definition.relations.children.collection(parent) // quickfix!
                    parent.relations.children.push(child)
                    rangeRecords[child.lft] = child

                    delete rangeRecords[child.lft - 1]
                    rangeRecords[child.rgt] = parent
                  }
                }
              }
            })
        }
      }
    })

    this.beforeCreate(function(record, options) {
      if (record.parent_id) {
        // search the parent node
        return self.model
          .find(record.parent_id)
          .useTransaction(options.transaction)
          .exec(function(parent) {
            if (parent) {
              return self
                .query(options)
                .where('rgt', '>=', parent.rgt)
                .increment('rgt', 2)
                .then(function() {
                  return self
                    .query(options)
                    .where('lft', '>', parent.rgt)
                    .increment('lft', 2)
                })
                .then(function() {
                  record.lft = parent.rgt // values before the update - see above
                  record.rgt = parent.rgt + 1
                  record.depth = parent.depth + 1
                })
            }
          })
      } else {
        // new root node!
        return self.model
          .rootOnly()
          .order('rgt', true)
          .first()
          .useTransaction(options.transaction)
          .exec(function(rootSibling) {
            if (rootSibling) {
              record.lft = rootSibling.rgt + 1
              record.rgt = rootSibling.rgt + 2
            } else {
              record.lft = 1
              record.rgt = 2
            }
            record.depth = 0
          })
      }
    })

    // http://falsinsoft.blogspot.co.at/2013/01/tree-in-sql-database-nested-set-model.html

    this.beforeUpdate(function(record, options) {
      if (record.hasChanged('parent_id')) {
        if (record.parent_id) {
          return self.model
            .find(record.parent_id)
            .useTransaction(options.transaction)
            .exec(function(parent) {
              if (parent) {
                record.__parent_rgt = parent.rgt // we need that in the afterUpdate
                record.__depth_diff = record.depth - parent.depth - 1 // we need that in the afterUpdate

                record.depth = parent.depth + 1 // only set the depth - the rest will be done by afterUpdate
              } else {
                throw new Error(
                  "can't find parent node with id " + record.parent_id
                )
              }
            })
        } else {
          // change to a root node
          return self.model
            .rootOnly()
            .order('rgt', true)
            .first()
            .useTransaction(options.transaction)
            .exec(function(rootSibling) {
              if (rootSibling) {
                record.__parent_rgt = rootSibling.rgt + 1
              } else {
                record.__parent_rgt = record.rgt - record.lft
              }

              record.__depth_diff = record.depth
              record.depth = 0
            })
        }
      }
    })

    // TODO: move afterUpdate into beforeUpdate...
    // changes all nodes if a record got a new parent
    this.afterUpdate(function(record, options) {
      if (record.hasChanged('parent_id')) {
        var lft = record.lft
        var rgt = record.rgt
        var parentRgt = record.__parent_rgt
        var depthDiff = record.__depth_diff

        var raw = self.store.connection.raw.bind(self.store.connection)

        var rgtCol = record.definition.store.connection.client.wrapIdentifier(
          'rgt'
        )
        var lftCol = record.definition.store.connection.client.wrapIdentifier(
          'lft'
        )
        var depthCol = record.definition.store.connection.client.wrapIdentifier(
          'depth'
        )
        var query = self.query(options)

        if (record.__parent_rgt < lft) {
          // move the records to the "left"
          return query
            .whereBetween('lft', [parentRgt, rgt])
            .orWhereBetween('rgt', [parentRgt, rgt])
            .update({
              depth: raw(
                [
                  'CASE WHEN',
                  lftCol + ' >',
                  lft,
                  'AND ' + rgtCol + ' <',
                  rgt, // if it's any of it's children
                  'THEN ' + depthCol + ' - ',
                  depthDiff,
                  'ELSE ' + depthCol + ' END' // dont change the depth
                ].join(' ')
              ),

              rgt: raw(
                [
                  rgtCol + ' + CASE WHEN',
                  rgtCol + ' BETWEEN',
                  lft,
                  'AND',
                  rgt, // if it's the current record or one of it's children
                  'THEN',
                  parentRgt - lft,
                  'WHEN ' + rgtCol + ' BETWEEN',
                  parentRgt,
                  'AND',
                  lft - 1, // if it's a record between the old and the new location
                  'THEN',
                  rgt - lft + 1,
                  'ELSE 0 END'
                ].join(' ')
              ),

              lft: raw(
                [
                  lftCol + ' + CASE WHEN',
                  lftCol + ' BETWEEN',
                  lft,
                  'AND',
                  rgt, // if it's the current record or one of it's children
                  'THEN',
                  parentRgt - lft,
                  'WHEN ' + lftCol + ' BETWEEN',
                  parentRgt,
                  'AND',
                  lft - 1, // if it's a record between the old and the new location
                  'THEN',
                  rgt - lft + 1,
                  'ELSE 0 END'
                ].join(' ')
              )
            })
            .then(function() {
              debug(query.toString())
            })
        } else {
          // move the records to the "right"
          return query
            .whereBetween('lft', [lft, parentRgt])
            .orWhereBetween('rgt', [lft, parentRgt])
            .update({
              depth: raw(
                [
                  'CASE WHEN',
                  lftCol + ' >',
                  lft,
                  'AND ' + rgtCol + ' <',
                  rgt, // if it's any of it's children
                  'THEN ' + depthCol + ' - ',
                  depthDiff,
                  'ELSE ' + depthCol + ' END' // dont change the depth
                ].join(' ')
              ),

              rgt: raw(
                [
                  rgtCol + ' + CASE WHEN',
                  rgtCol + ' BETWEEN',
                  lft,
                  'AND',
                  rgt, // if it's the current record or one of it's children
                  'THEN',
                  parentRgt - rgt - 1,
                  'WHEN ' + rgtCol + ' BETWEEN',
                  rgt + 1,
                  'AND',
                  parentRgt - 1, // if it's a record between the old and the new location
                  'THEN',
                  lft - rgt - 1,
                  'ELSE 0 END'
                ].join(' ')
              ),

              lft: raw(
                [
                  lftCol + ' + CASE WHEN',
                  lftCol + ' BETWEEN',
                  lft,
                  'AND',
                  rgt, // if it's the current record or one of it's children
                  'THEN',
                  parentRgt - rgt - 1,
                  'WHEN ' + lftCol + ' BETWEEN',
                  rgt + 1,
                  'AND',
                  parentRgt - 1, // if it's a record between the old and the new location
                  'THEN',
                  lft - rgt - 1,
                  'ELSE 0 END'
                ].join(' ')
              )
            })
            .then(function() {
              debug(query.toString())
            })
        }
      }
    })

    // handles the deletion of nodes!
    this.afterDestroy(function(record, options) {
      var Model = this.model
      var raw = self.store.connection.raw.bind(self.store.connection)

      var width = record.rgt - record.lft + 1

      var rgtCol = record.definition.store.connection.client.wrapIdentifier(
        'rgt'
      )
      var lftCol = record.definition.store.connection.client.wrapIdentifier(
        'lft'
      )
      return Model.useTransaction(options.transaction)
        .where({ lft_between: [record.lft, record.rgt] })
        .delete(options)
        .then(function() {
          return self
            .query(options)
            .where('rgt', '>', record.rgt)
            .update({ rgt: raw(rgtCol + ' - ' + width) })
        })
        .then(function() {
          return self
            .query(options)
            .where('lft', '>', record.rgt)
            .update({ lft: raw(lftCol + ' - ' + width) })
        })
    })

    // Record methods

    this.instanceMethods.moveToChildOf = function(id) {
      if (typeof id === 'object') id = id.id
      this.parent_id = id
    }

    return this
  }
}
