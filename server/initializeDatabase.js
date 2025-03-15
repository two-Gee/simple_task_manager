const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const initializeTables = () => {
  // Create tables
  db.serialize(() => {
    db.run("CREATE TABLE lists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
    db.run("CREATE TABLE tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, due_date TEXT, completed BOOLEAN, locked_by INTEGER, lock_expiration INTEGER, list_id INTEGER)");
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT)");
    db.run("CREATE TABLE task_assignments (task_id INTEGER, user_id INTEGER, add_counter INTEGER, remove_counter INTEGER, PRIMARY KEY (task_id, user_id))");
    db.run("CREATE TABLE list_users (list_id INTEGER, user_id INTEGER, PRIMARY KEY (list_id, user_id))");
  });
};

const initializeTestData = () => {
    // Insert test data
    db.serialize(() => {
    db.run("INSERT INTO users (username) VALUES ('user1')");
    db.run("INSERT INTO users (username) VALUES ('user2')");
    db.run("INSERT INTO lists (name) VALUES ('List 1')");
    db.run("INSERT INTO lists (name) VALUES ('List 2')");
    db.run("INSERT INTO list_users (list_id, user_id) VALUES (1, 1)");
    db.run("INSERT INTO list_users (list_id, user_id) VALUES (1, 2)");
    db.run("INSERT INTO list_users (list_id, user_id) VALUES (2, 2)");
    db.run("INSERT INTO tasks (title, due_date, completed, locked_by, lock_expiration, list_id) VALUES ('Task 1', '2023-12-31', 0, NULL, NULL, 1)");
    db.run("INSERT INTO tasks (title, due_date, completed, locked_by, lock_expiration, list_id) VALUES ('Task 2', '2023-12-31', 0, NULL, NULL, 1)");
    db.run("INSERT INTO tasks (title, due_date, completed, locked_by, lock_expiration, list_id) VALUES ('Task 3', '2023-12-31', 0, NULL, NULL, 2)");
    db.run("INSERT INTO task_assignments (task_id, user_id, add_counter, remove_counter) VALUES (1, 1, 1, 0)");
    db.run("INSERT INTO task_assignments (task_id, user_id, add_counter, remove_counter) VALUES (2, 2, 1, 0)");
    db.run("INSERT INTO task_assignments (task_id, user_id, add_counter, remove_counter) VALUES (3, 2, 1, 0)");
    });
}


module.exports = { db, initializeTables, initializeTestData };