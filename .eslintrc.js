// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  extends: 'standard',

  "env": {
    "node": true,
    "mocha": true
  },

  rules: {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,

    'space-before-blocks': 0,
    'keyword-spacing': 0,
    'no-multiple-empty-lines': 0,
    'space-before-function-paren': [2, {anonymous: 'never', named: 'never' }],
    'semi': [2, 'never']
  },

  globals: {
    testMYSQL: true,
    afterMYSQL: true,
    beforeMYSQL: true,
    beforePG: true,
    afterPG: true,
    testPG: true,
    beforeSQLite: true,
    afterSQLite: true,
    testSQLite: true,
    testOracle: true,
    afterOracle: true,
    beforeOracle: true,
    beforeActiveDirectory: true,
    afterActiveDirectory: true,
    testActiveDirectory: true,
    beforeGraphQL: true,
    afterGraphQL: true,
    LDAP_BASE: true
  }
}
