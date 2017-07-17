var position = 'position'

exports.migration = {
  sortedList: function(){
    this.integer(position)
  }
}


exports.definition = {

  sortedList: function(options){
    var self = this
    options = options || {}

    if(options.scope && !Array.isArray(options.scope)) options.scope = [options.scope]

    // before find - add position sorting
    this.beforeFind(function(){
      if(options.scope){
        for(var i = 0; i < options.scope.length; i++){
          this.order(options.scope[i])
        }
      }

      this.order(position)
    })




    // before save: calculate new position for new records
    this.beforeSave(function(record, t, next){
      var primaryKeys = self.primary_keys
      var condition = {}
      var i

      for(i = 0; i < primaryKeys.length; i++){
        if(this[primaryKeys[i]]){
          condition[primaryKeys[i] + '_not'] = this[primaryKeys[i]]
        }
      }

      if(options.scope){
        for(i = 0; i < options.scope.length; i++){
          condition[options.scope[i]] = this[options.scope[i]]
        }
      }


      if(record[position] !== null){
        // check position

        if(record[position] < 0) record[position] = 0

        self.model.max(position).where(condition).exec(function(result){
          if(record[position] > record + 1){
            record[position] = result + 1
          }
          next()
        })
      }else{
        // non existing position
        if(options.insert === 'beginning'){
          record[position] = 0
          return next()
        }else{
          self.model.max(position).where(condition).exec(function(result){
            if(isNaN(result)) result = -1 // no entry in table
            record[position] = result + 1
            next()
          })
        }
      }
    })



    this.afterSave(function(record, t, next){
      if(record.hasChanged(position)){
        var before = record.changes[position][0]
        var tmp = self.query().transacting(t)


        if(options.scope){
          for(var i = 0; i < options.scope.length; i++){
            tmp.where(options.scope[i], '=', record[options.scope[i]])
          }
        }


        if(before === undefined) before = null

        if(before === null || before > record[position]){
          tmp.where(position, '>=', record[position])
          tmp.where('id', '!=', record.id)

          if(before !== null){
            tmp.where(position, '<', before)
          }

          return tmp.increment(position, 1).then(function(){
            next()
          })
        }else{
          tmp.where(position, '<=', record[position])
          tmp.where('id', '!=', record.id)
          tmp.where(position, '>', before)

          return tmp.increment(position, -1).then(function(){
            next()
          })
        }
      }
      next()
    })


    this.afterSave(function(record, t, next){
      if(options.scope){
        var scopeChanged = false
        var tmp = self.query()

        if(record.hasChanged()){
          tmp.where(position, '>', record.changes[position][0])
        }else{
          tmp.where(position, '>', record[position])
        }

        for(var i = 0; i < options.scope.length; i++){
          if(record.hasChanged(options.scope[i])){
            scopeChanged = true
            tmp.where(options.scope[i], '=', record.changes[options.scope[i]][0])
          }else{
            tmp.where(options.scope[i], '=', record[options.scope[i]])
          }
        }


        if(scopeChanged){
          return tmp.transacting(t).increment(position, -1).then(function(){
            next()
          })
        }
      }

      next()
    })




    this.afterDestroy(function(record, t, next){
      var tmp = self.query().transacting(t)
      tmp.where(position, '>', record[position])

      if(options.scope){
        for(var i = 0; i < options.scope.length; i++){
          tmp.where(options.scope[i], '=', record[options.scope[i]])
        }
      }

      tmp.increment(position, -1).then(function(){
        next()
      })
    })
  }
}
