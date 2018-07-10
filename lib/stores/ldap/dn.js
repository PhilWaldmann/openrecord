exports.definition = {
  mixinCallback: function() {
    this.rdn_prefix = 'cn'
  },

  /**
   * Set the rdn prefix
   *
   * @public
   * @memberof LDAP.Definition
   * @param {string} prefix - The prefix
   *
   * @return {Definition}
   */
  rdnPrefix: function(prefix) {
    this.rdn_prefix = prefix
    return this
  },

  dn: function(record) {
    if (!record[this.rdn_prefix] && record.dn) return record.dn
    return (
      this.rdn_prefix + '=' + record[this.rdn_prefix] + ',' + record.parent_dn
    )
  }
}
