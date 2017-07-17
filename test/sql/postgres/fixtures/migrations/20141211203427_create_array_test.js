module.exports = function(){
  this.createTable('array_tests', function(){
    this.integerArray('int_arr')
    this.floatArray('float_arr')
    this.booleanArray('bool_arr')
    this.dateArray('date_arr')
    this.datetimeArray('datetime_arr')
    this.timeArray('time_arr')
    this.stringArray('str_arr')
  })
}
