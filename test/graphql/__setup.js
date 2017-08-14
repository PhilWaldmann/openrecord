// var path = require('path')
// var Store = require('../../lib/store')

/*

  STRUCTURE

SQLite3
  Person -< (children / parents) >- Person
  Person >- (live / residents) >- House
  House >- State >- Country

PG
  Person -< (friendship) >- Person
  Person -< Post
  Post -< (likes) -< Person
  Post -< Comments
  Comment >- Person
 */


// global.beforeGraphQL = function(database, done){
//   database = 'graphql_' + database
//
//   var sql = [
//     'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, active boolean)',
//     'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
//     'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
//     "INSERT INTO users(login, email, active) VALUES('phil', 'phil@mail.com', true), ('michl', 'michl@mail.com', false), ('admin', 'admin@mail.com', true)",
//     "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
//     "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')"
//   ]
//
//   beforePG(database, sql, function(){
//     beforeMYSQL(database, sql, function(){
//       beforeSQLite(path.join(__dirname, database + '.sqlite3'), sql, function(){
//         var pgstore = new Store({
//
//         })
//       })
//     })
//   })
// }
//
// global.afterGraphQL = function(database){
//
// }
