
exports.model = {

  /**
   * Executes the find
   *
   * @class Model
   * @method exec
   * @param {function} resolve - The resolve callback
   * @param {function} reject - The reject callback
   *
   * @callback
   * @param {array|object} result - Either a Collection of records or a single Record
   * @this Collection
   */
  exec: function(resolve, reject){
    var self = this.chain();

    //if .find(null) was called
    if(self.getInternal('exec_null')){
      return resolve(null);
    }


    var options = self.getExecOptions();

    return self.promise(function(resolve, reject){

      self.callInterceptors('beforeFind', [options], function(okay){
        if(okay){

          var data = {};

          self.callInterceptors('onFind', [options, data], function(){

            if(data.error){
              return reject(data.error);
            }


            var as_raw  = self.getInternal('as_raw');

            if(as_raw){

              resolve(data.result);

            }else{

              self.callInterceptors('afterFind', [data], function(okay){
                if(okay){
                  resolve(data.result);
                }else{
                  resolve(null);
                }
              }, reject);

            }

          });

        }else{
          resolve(null);
        }
      }, reject);

    }, resolve, reject);
  },


  getExecOptions: function(){
    return {};
  }
};
