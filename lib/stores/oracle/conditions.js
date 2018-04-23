/*
 * DEFINITION
 */
exports.definition = {
  mixinCallback: function() {
    this.onRawCondition(function(chain, condition) {
      var attrsRegExp = new RegExp(
        '(' + Object.keys(chain.definition.attributes).join('|') + ')',
        'g'
      )

      // add quotes to attribute names
      condition.query = condition.query.replace(attrsRegExp, '"$1"')
    }, 10)
  }
}
