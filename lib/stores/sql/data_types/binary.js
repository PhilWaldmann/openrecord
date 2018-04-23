exports.store = {
  mixinCallback: function() {
    this.addType(
      'binary',
      {
        read: function(value) {
          if (value === null) return null

          if (Buffer.from) return Buffer.from(value, 'binary')
          return new Buffer(value, 'binary') // eslint-disable-line node/no-deprecated-api
        },
        write: function(buffer) {
          if (buffer === null) return null
          return buffer.toString('binary')
        }
      },
      {
        migration: 'binary',
        extend: Buffer,
        operators: {
          defaults: ['eq', 'not']
        }
      }
    )
  }
}
