exports.record = {
  save(options, resolve, reject){
    if(typeof options == 'function'){
      reject = resolve;
      resolve = options;
      options = {};
    }

    return this.callParent(options)
    .then(function(success){
      if(success) return this;
      throw new Error('validation failed');
    })
    .then(resolve, reject)
  }
};
