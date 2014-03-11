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
  'CREATE TABLE avatars(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, url TEXT)',
  'CREATE TABLE unread_posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, post_id INTEGER)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01"), ("administrator", "administrator@mail.com", "2014-01-01"), ("marlene", "marlene@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread"), (3, "third thread")',
  'INSERT INTO avatars(user_id, url) VALUES(1, "http://awesome-avatar.com/avatar.png"), (1, "http://awesome-avatar.com/foo.png")',
  'INSERT INTO unread_posts(user_id, post_id) VALUES(1, 3)'
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

testSQLite('dependent_delete', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")'
]);

testSQLite('dependent_destroy', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")'
]);

testSQLite('dependent_nullify', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")'
]);


testSQLite('destroy', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread"), (3, "delete me"), (3, "delete me too"), (3, "destroy me"), (3, "do not destroy")'
]);

testSQLite('exec', []);

testSQLite('includes', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT)',
  'CREATE TABLE avatars(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, url TEXT)',
  'CREATE TABLE unread_posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, post_id INTEGER)',
  'CREATE TABLE poly_things(id INTEGER PRIMARY KEY AUTOINCREMENT, member_id integer, member_type text, user_id integer)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post")',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")',
  'INSERT INTO avatars(user_id, url) VALUES(1, "http://awesome-avatar.com/avatar.png"), (1, "http://awesome-avatar.com/foo.png")',
  'INSERT INTO unread_posts(user_id, post_id) VALUES(1, 3)',
  'INSERT INTO poly_things (member_id, member_type, user_id) VALUES (1, "Post", 1), (1, "Thread", 1), (2, "Thread", 2), (1, "Avatar", 2)'
]);

testSQLite('autojoin', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, archived BOOLEAN)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01"), ("marlene", "marlene@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post"), (4, 4, NULL)',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")',
]);

testSQLite('joins', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, archived BOOLEAN)',
  'CREATE TABLE avatars(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, url TEXT)',
  'CREATE TABLE unread_posts(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, post_id INTEGER)',
  'CREATE TABLE poly_things(id INTEGER PRIMARY KEY AUTOINCREMENT, member_id integer, member_type text)',
  'INSERT INTO users(login, email, created_at) VALUES("phil", "phil@mail.com", "2014-01-05"), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", "2014-01-01"), ("marlene", "marlene@mail.com", "2014-01-01")',
  'INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, "first message"), (1, 1, "second"), (1, 2, "third"), (2, 1, "michls post"), (4, 4, NULL)',
  'INSERT INTO threads(user_id, title) VALUES(2, "first thread"), (1, "second thread")',
  'INSERT INTO threads(user_id, title, archived) VALUES(4, "x marlenes thread", "false")',
  'INSERT INTO avatars(user_id, url) VALUES(1, "http://awesome-avatar.com/avatar.png"), (1, "http://awesome-avatar.com/foo.png")',
  'INSERT INTO unread_posts(user_id, post_id) VALUES(1, 3)',
  'INSERT INTO poly_things (member_id, member_type) VALUES (1, "Post"), (1, "Thread"), (2, "Thread"), (1, "Avatar")'
]);

testSQLite('migrations_fresh', []);

testSQLite('migrations', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT NOT NULL, first_name TEXT)',
  'CREATE TABLE openrecord_migrations(name TEXT)',
  'INSERT INTO openrecord_migrations VALUES("20140223120815_create_users")'
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



//plugins
testSQLite('plugins/paranoid', [
  'CREATE TABLE users(id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, email TEXT, deleted_at TEXT)',
  'INSERT INTO users(login, email, deleted_at) VALUES("phil", "phil@mail.com", NULL), ("michl", "michl@mail.com", "2014-01-10"), ("admin", "admin@mail.com", NULL), ("marlene", "marlene@mail.com", "2014-01-01"), ("hans", "hans@mail.com", NULL)'
]);