const path = require('path')

exports.store = {
  mixinCallback: function() {
    this.migration_table =
      this.config.migration_table || 'openrecord_migrations'
    this.migrations = []

    if (this.config.migrations) {
      this.loadMigrations(this.config.migrations)

      this.use(function() {
        return this.runMigrations()
      }, 100)
    }
  },

  Migration: function(name, fn) {
    this.migrations.push({ name: name, fn: fn })
  },

  loadMigrations: function(modules) {
    var migrations = this.utils.getModules(modules)

    for (var fullpath in migrations) {
      if (
        migrations.hasOwnProperty(fullpath) &&
        typeof migrations[fullpath] === 'function'
      ) {
        var migrationName = path.basename(fullpath, path.extname(fullpath))

        this.Migration(migrationName, migrations[fullpath])
      }
    }
  },

  runMigrations: function() {
    if (
      !this.connection ||
      this.migrations.length === 0 ||
      this.migrations_finished
    ) {
      this.migrations_finished = true
      return
    }

    var self = this
    return this.loadMigrationHistory()
      .then(function(finishedMigrations) {
        return self.runMissingMigrations(finishedMigrations)
      })
      .then(function() {
        self.migrations_finished = true
      })
  },

  loadMigrationHistory: function() {
    var self = this

    return this.connection.schema
      .hasTable(this.migration_table)
      .then(function(exists) {
        if (!exists) {
          return self.connection.schema.createTable(
            self.migration_table,
            function(table) {
              table.string('name')
            }
          )
        }
      })
      .then(function() {
        return self.connection(self.migration_table)
      })
      .then(function(result) {
        return result.map(function(row) {
          return row.name
        })
      })
  },

  runMissingMigrations: function(finishedMigrations, callback) {
    var missing = []
    var self = this

    var Migration = { connection: this.connection, store: this }
    this.utils.mixin(Migration, this.mixinPaths, { only: 'migration' })
    this.utils.mixinCallbacks(Migration, {})

    // Migrations are handled in series
    // First the migration method will be called
    // for every operation a new queue item will be added
    // after that, we'll execute the queue
    for (var i = 0; i < this.migrations.length; i++) {
      if (finishedMigrations.indexOf(this.migrations[i].name) === -1) {
        ;(function(fn, name) {
          missing.push(function() {
            return self.connection.transaction(function(query) {
              Migration.connection = query
              Migration.queue = []

              return Promise.resolve(fn.call(Migration))
                .then(function() {
                  return self.utils.series(Migration.queue)
                })
                .then(function() {
                  return query.insert({ name: name }).into(self.migration_table)
                })
            })
          })
        })(this.migrations[i].fn, this.migrations[i].name)
      }
    }

    return self.utils.series(missing)
  }
}
