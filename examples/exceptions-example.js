/**
 * Eception Handling Example
 * @example Model.then
 */
User.limit(1).then(function(){
  // success
}).catch(SQLError, function(e){
  // handle exception
})

// or

User.on('exception', function(e){
  // handle exception
})

User.limit(1).then(function(){
  // success
})

// or

store.on('exception', function(e){
  // handle exception
})

User.limit(1).then(function(){
  // success
})
