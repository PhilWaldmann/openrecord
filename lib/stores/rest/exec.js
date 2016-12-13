var Utils = require('../../utils');
var Store = require('../../store');

exports.definition = {
  mixinCallback: function(){
    var self = this;

    this.onFind(function(options, data, next){
      Utils.applyParams(options);

      this.connection.get(options, function(err, req, res, obj){

        self.logger.info(options.path);

        err = err || obj[self.errorParam || 'error'];
        if(err) data.error = err;

        data.result = obj;

        next();

      });
    });
  }
}


/*
 * MODEL
 */
exports.model = {

  getExecOptions: function(){
    var action = this.getInternal('action') || 'index';
    return Utils.clone(this.definition.actions[action]);
  }

};
