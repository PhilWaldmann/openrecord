require('./__helper');

testPG('aggregate_function', [
  'CREATE TABLE users(id serial primary key, salary INTEGER)',
  'INSERT INTO users(salary) VALUES(100), (200), (400), (300), (1000)'
]);

testPG('attributes', [
  'CREATE TABLE users(id serial primary key, login TEXT NOT NULL, email TEXT)',
  'CREATE TABLE multiple_keys(id  INTEGER, id2 INTEGER, PRIMARY KEY(id, id2))',
  "INSERT INTO users(login, email) VALUES('phil', 'phil@mail.com')"
]);

testPG('conditions', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')"
]);

testPG('create', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id  serial primary key, user_id INTEGER, title TEXT)'
]);

testPG('data_types', [
  'CREATE TABLE users(id serial primary key, my_blob TEXT, my_integer INTEGER, my_real float)'
]);

testPG('destroy', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')"
]);

testPG('exec', []);

testPG('includes', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')"
]);


testPG('joins', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')"
]);

testPG('updates', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')"
]);

testPG('validations', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',      
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  'CREATE TABLE multiple_keys(id  INTEGER, id2 INTEGER, name TEXT, PRIMARY KEY(id, id2))',      
  "INSERT INTO multiple_keys(id, id2, name) VALUES(1, 1, 'phil'), (1, 2, 'michl'), (2, 1, 'admin')",
  'CREATE TABLE with_scopes(id serial primary key, name TEXT, scope_id INTEGER)',
  "INSERT INTO with_scopes(name, scope_id) VALUES('phil', 1), ('michl', 1), ('phil', 2)",
]);