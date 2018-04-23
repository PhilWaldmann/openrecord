exports.definition = {
  mixinCallback: function() {
    var res = this.resource
    var path = this.store.config.path || ''
    var baseParams = this.store.config.baseParams

    this.actions = {
      index: { method: 'get', url: '/' + path + res, params: baseParams || {} },
      show: {
        method: 'get',
        url: '/' + path + res + '/:id',
        params: baseParams || {}
      },
      create: {
        method: 'post',
        url: '/' + path + res,
        params: baseParams || {}
      },
      update: {
        method: 'put',
        url: '/' + path + res + '/:id',
        params: baseParams || {}
      },
      destroy: {
        method: 'delete',
        url: '/' + path + res + '/:id',
        params: baseParams || {}
      }
    }
  },

  addBaseParam: function(name, value) {
    for (var action in this.actions) {
      if (this.actions.hasOwnProperty(action)) {
        this.actions[action].params[name] = value
      }
    }
    return this
  }
}
