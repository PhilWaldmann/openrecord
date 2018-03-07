// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  extends: [
    'digitalbits',
    'prettier'
  ],

  env: {
    node: true,
    mocha: true
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
    getOracleConfig: true,
    beforeActiveDirectory: true,
    afterActiveDirectory: true,
    testActiveDirectory: true,
    beforeGraphQL: true,
    afterGraphQL: true,
    LDAP_BASE: true
  }
}