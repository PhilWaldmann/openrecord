/**
 * Use the `validates` function synchronous
 * @example Definition.validates
 */
store.model('MyModel', function(){
  this.validates('my_attr', function(){
    //your custom validation logic
    return true; //true: validation passes, false: validation failes
  });
});


/**
 * Use the `validates` function asynchronous
 * @example Definition.validates
 */
store.model('MyModel', function(){
  this.validates('my_attr', function(next){
    next(true);
  });
});


/**
 * Use the `validatesPresenceOf` to validate multiple attributes
 * @example Definition.validatesPresenceOf
 */
store.model('MyModel', function(){
  this.validatesPresenceOf('my_attr', 'my_attr2');
});


/**
 * Use the `validatesFormatOf` to validate an email address attribute
 * @example Definition.validatesFormatOf
 */
store.model('MyModel', function(){
  this.validatesFormatOf('my_email', 'email');
});


/**
 * Use the `validatesConfirmationOf` to validate a password confirmation
 * @example Definition.validatesConfirmationOf
 */
store.model('MyModel', function(){
  this.validatesConfirmationOf('password');
});