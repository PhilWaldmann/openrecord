exports.chain = {
  convertConditionAttribute: function(attribute, parentRelations) {
    parentRelations = parentRelations ||
      this.getInternal('parent_relations') || [this.definition.tableName]
    return this.definition.store.utils.toAttributeName(
      attribute,
      parentRelations
    )
  },

  escapeAttribute: function(attribute) {
    const query = this.query()
    return query.client.formatter(query).wrapString(attribute) // escape attribute. from `user.id` to `"user"."id"`
  }
}
