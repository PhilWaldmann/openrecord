require('./__helper');

testPG('aggregate_function', [
  'CREATE TABLE users(id serial primary key, salary INTEGER)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'INSERT INTO users(salary) VALUES(100), (200), (400), (300), (1000)',
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')"
]);

testPG('allowed_attributes', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, active boolean)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  "INSERT INTO users(login, email, active) VALUES('phil', 'phil@mail.com', true), ('michl', 'michl@mail.com', false), ('admin', 'admin@mail.com', true)",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')"
]);

testPG('attributes', [
  'CREATE TABLE users(id serial primary key, login TEXT NOT NULL, email TEXT)',
  'CREATE TABLE multiple_keys(id  INTEGER, id2 INTEGER, PRIMARY KEY(id, id2))',
  "INSERT INTO users(login, email) VALUES('phil', 'phil@mail.com')"
]);

testPG('collection', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  'CREATE TABLE avatars(id serial primary key, user_id INTEGER, url TEXT)',
  'CREATE TABLE unread_posts(id serial primary key, user_id INTEGER, post_id INTEGER)',
  'CREATE TABLE poly_things(id serial primary key, member_id integer, member_type text, message TEXT)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01'), ('administrator', 'administrator@mail.com', '2014-01-01'), ('marlene', 'marlene@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread'), (3, 'third thread')",
  "INSERT INTO avatars(user_id, url) VALUES(1, 'http://awesome-avatar.com/avatar.png'), (1, 'http://awesome-avatar.com/foo.png')",
  "INSERT INTO unread_posts(user_id, post_id) VALUES(1, 3)"
]);

testPG('conditions', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, private_email TEXT, created_at date)',
  "INSERT INTO users(login, email, private_email, created_at) VALUES('phil', 'phil@mail.com', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '', '2014-01-10'), ('admin', 'admin@mail.com', 'hansi@mail.com', '2014-01-01')"
]);

testPG('converter', [
  'CREATE TABLE users(id serial primary key, my_blob TEXT, my_integer INTEGER, my_real float)',
  "INSERT INTO users(my_blob, my_integer, my_real) VALUES('phil', 12, 44.66)"
]);

testPG('create', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id  serial primary key, user_id INTEGER, title TEXT)'
]);

testPG('data_types', [
  'CREATE TABLE users(id serial primary key, my_blob TEXT, my_integer INTEGER, my_real float)'
]);

testPG('dependent_delete', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  'CREATE TABLE poly_things(id serial primary key, member_id integer, member_type text, user_id integer)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 3, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread'), (1, '3. thread'), (1, '4. thread')",
  "INSERT INTO poly_things (member_id, member_type, user_id) VALUES (4, 'Post', 1), (3, 'Thread', 1), (4, 'Thread', 2), (1, 'Avatar', 2)"
]);

testPG('dependent_destroy', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  'CREATE TABLE poly_things(id serial primary key, member_id integer, member_type text, user_id integer)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post'), (2, 3, 'michls post'), (5, 5, 'unknown post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread'), (1, '3. thread'), (1, '4. thread')",
  "INSERT INTO poly_things (member_id, member_type, user_id) VALUES (6, 'Post', 1), (3, 'Thread', 1), (4, 'Thread', 2), (5, 'Post', 2)"
]);

testPG('dependent_nullify', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')"
]);

testPG('destroy', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread'), (3, 'delete me'), (3, 'delete me too'), (3, 'destroy me'), (3, 'do not destroy')"
]);

testPG('exec', []);

testPG('includes', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  'CREATE TABLE avatars(id serial primary key, user_id INTEGER, url TEXT)',
  'CREATE TABLE unread_posts(id serial primary key, user_id INTEGER, post_id INTEGER)',
  'CREATE TABLE poly_things(id serial primary key, member_id integer, member_type text, user_id integer)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')",
  "INSERT INTO avatars(user_id, url) VALUES(1, 'http://awesome-avatar.com/avatar.png'), (1, 'http://awesome-avatar.com/foo.png')",
  "INSERT INTO unread_posts(user_id, post_id) VALUES(1, 3)",
  "INSERT INTO poly_things (member_id, member_type, user_id) VALUES (1, 'Post', 1), (1, 'Thread', 1), (2, 'Thread', 2), (1, 'Avatar', 2)"
]);


testPG('autojoin', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT, archived BOOLEAN)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01'), ('marlene', 'marlene@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post'), (4, 4, NULL)",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')",
]);


testPG('joins', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT, archived BOOLEAN)',
  'CREATE TABLE avatars(id serial primary key, user_id INTEGER, url TEXT)',
  'CREATE TABLE unread_posts(id serial primary key, user_id INTEGER, post_id INTEGER)',
  'CREATE TABLE poly_things(id serial primary key, member_id integer, member_type text, user_id integer)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01'), ('marlene', 'marlene@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post'), (4, 4, NULL)",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')",
  "INSERT INTO threads(user_id, title, archived) VALUES(4, 'x marlenes thread', false)",
  "INSERT INTO avatars(user_id, url) VALUES(1, 'http://awesome-avatar.com/avatar.png'), (1, 'http://awesome-avatar.com/foo.png')",
  "INSERT INTO unread_posts(user_id, post_id) VALUES(1, 3)",
  "INSERT INTO poly_things (member_id, member_type, user_id) VALUES (1, 'Post', 1), (1, 'Thread', 1), (2, 'Thread', 2), (1, 'Avatar', 2)"
]);

testPG('migrations_fresh', []);

testMYSQL('group', [
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first'), (1, 1, 'second'), (3, 2, 'third'), (2, 2, 'first')"
]);

testPG('migrations', [
  'CREATE TABLE users(id serial primary key, login TEXT NOT NULL, first_name TEXT)',
  'CREATE TABLE openrecord_migrations(name TEXT)',
  "INSERT INTO openrecord_migrations VALUES('20140223120815_create_users')"
]);


testPG('promise', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',  
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post'), (4, 4, NULL)"
]);


testPG('select', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01'), ('administrator', 'administrator@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')"
]);

testPG('temporary_definition', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01'), ('administrator', 'administrator@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread')"
]);

testPG('updates', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT)',
  'CREATE TABLE threads(id serial primary key, user_id INTEGER, title TEXT)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01'), ('administrator', 'administrator@mail.com', '2014-01-01'), ('new_owner', 'new_owner@mail.com', '2014-01-01')",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post'), (5, 4, 'update me')",
  "INSERT INTO threads(user_id, title) VALUES(2, 'first thread'), (1, 'second thread'), (1, 'another'), (1, 'thread 4')"
]);

testPG('validations', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at TEXT)',      
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', '2014-01-05'), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', '2014-01-01')",
  'CREATE TABLE multiple_keys(id  INTEGER, id2 INTEGER, name TEXT, PRIMARY KEY(id, id2))',      
  "INSERT INTO multiple_keys(id, id2, name) VALUES(1, 1, 'phil'), (1, 2, 'michl'), (2, 1, 'admin')",
  'CREATE TABLE with_scopes(id serial primary key, name TEXT, scope_id INTEGER)',
  "INSERT INTO with_scopes(name, scope_id) VALUES('phil', 1), ('michl', 1), ('phil', 2)",
]);



//plugins
testPG('plugins/nested_set', [
  'CREATE TABLE folders(id serial primary key, name text, parent_id integer, lft INTEGER, rgt integer, depth integer)',
  "INSERT INTO folders(name, parent_id, lft, rgt, depth) VALUES('A', 0, 0, 3, 0), ('A1', 1, 1, 2, 1), ('B', 0, 4, 13, 0), ('B1', 3, 5, 6, 1), ('B2', 3, 7, 12, 1), ('B2.1', 5, 8, 11, 2), ('B2.1.1', 6, 9, 10, 3)"
]);

testPG('plugins/paranoid', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, deleted_at timestamp)',
  "INSERT INTO users(login, email, deleted_at) VALUES('phil', 'phil@mail.com', NULL), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', NULL), ('marlene', 'marlene@mail.com', '2014-01-01'), ('hans', 'hans@mail.com', NULL)"
]);

testPG('plugins/sorted_list', [
  'CREATE TABLE my_lists(id serial primary key, name text, position integer)',
  'CREATE TABLE my_scoped_lists(id serial primary key, name text, position integer, my_scope integer)',
  "INSERT INTO my_lists(name, position) VALUES('D', 3), ('E', 4), ('F', 5), ('G', 6), ('A', 0), ('B', 1), ('C', 2)",
  "INSERT INTO my_scoped_lists(name, position, my_scope) VALUES('B2', 1, 2), ('D1', 3, 1), ('A3', 0, 3), ('A1', 0, 1), ('A2', 0, 2), ('B1', 1, 1), ('C1', 2, 1)"
]);

testPG('plugins/stampable', [
  'CREATE TABLE users(id serial primary key, login TEXT, email TEXT, created_at timestamp, updated_at timestamp, creator_id integer, updater_id integer)',
  'CREATE TABLE posts(id serial primary key, user_id INTEGER, thread_id INTEGER, message TEXT, created_at timestamp, updated_at timestamp, creator_id integer, updater_id integer)',
  "INSERT INTO users(login, email, created_at) VALUES('phil', 'phil@mail.com', NULL), ('michl', 'michl@mail.com', '2014-01-10'), ('admin', 'admin@mail.com', NULL), ('marlene', 'marlene@mail.com', '2014-01-01'), ('hans', 'hans@mail.com', NULL)",
  "INSERT INTO posts(user_id, thread_id, message) VALUES(1, 1, 'first message'), (1, 1, 'second'), (1, 2, 'third'), (2, 1, 'michls post'), (5, 4, 'update me')"
]);