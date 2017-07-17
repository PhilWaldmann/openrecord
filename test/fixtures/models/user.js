var path = require('path')

module.exports = function(){
  this.require(path.join(__dirname, '_user', '*'))
}
