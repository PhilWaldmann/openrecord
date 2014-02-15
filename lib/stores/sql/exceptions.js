var Store = require('../../store');

Store.addExceptionType(function SQLError(error){
  Error.apply(this);
  this.message = error;
});


Store.addExceptionType(function CurrentlyNotSupportedError(message){
  Error.apply(this);
  this.message = message;
});
