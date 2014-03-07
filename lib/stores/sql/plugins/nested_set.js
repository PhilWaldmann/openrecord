exports.migration = {
  nestedSet: function(){
    this.integer('left');
    this.integer('right');
    this.integer('depth');
    this.integer('parent_id');
  }
};