/*
 * STORE
 */
exports.store = {
  mixinCallback: function() {
    this.addInterceptor('onJoin')
  }
}
