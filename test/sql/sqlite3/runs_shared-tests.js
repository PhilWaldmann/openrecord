require('./__helper');

testSQLite('aggregate_function', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, salary INTEGER)',
  'INSERT INTO users(salary) VALUES(100), (200), (400), (300), (1000)'
]);

testSQLite('attributes', [
  'CREATE TABLE users(id  INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT NOT NULL, email TEXT)',
  'CREATE TABLE multiple_keys(id  INTEGER, id2 INTEGER, PRIMARY KEY(id, id2))',
  'INSERT INTO users(login, email) VALUES("phil", "phil@mail.com")'
]);

testSQLite('collection', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01"), ("administrator", "administrator@mail.com", "2014-01-01"), ("marlene", "marlene@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")'
]);

testSQLite('conditions', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")'
]);

testSQLite('create', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)'
]);

testSQLite('data_types', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, my_blob BLOB, my_integer INTEGER, my_real REAL)'
]);

testSQLite('destroy', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")'
]);

testSQLite('exec', []);

testSQLite('includes', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")'
]);

testSQLite('joins', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01"), ("marlene", "marlene@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post"), (4, 4, NULL)',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")'
]);

testSQLite('updates', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01"), ("administrator", "administrator@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")'
]);

testSQLite('validations', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',      
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")',
  'CREATE TABLE multiple_keys(id  INTEGER, id2 INTEGER, name TEXT, PRIMARY KEY(id, id2))',      
  'INSERT INTO multiple_keys(id, id2, name) VALUES(1, 1, "phil"), (1, 2, "michl"), (2, 1, "admin")',
  'CREATE TABLE with_scopes(id  INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, scope_id INTEGER)',
  'INSERT INTO with_scopes(name, scope_id) VALUES("phil", 1), ("michl", 1), ("phil", 2)',
]);