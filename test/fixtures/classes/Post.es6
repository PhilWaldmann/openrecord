const Store = require('../../../store')

class BasePost extends Store.BaseModel {
  static definition() {
    this.validatesPresenceOf('message')
  }
}

class Post extends BasePost {
  static definition() {
    this.belongsTo('user')
    this.belongsTo('thread')
    super.definition()
  }
}

module.exports = Post
