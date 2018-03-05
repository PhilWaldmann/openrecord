const Store = require('../../../store')

class Post extends Store.BaseModel{
  static definition(){
    this.belongsTo('user')
    this.belongsTo('thread')

    this.validatesPresenceOf('message')
  }
}

module.exports = Post