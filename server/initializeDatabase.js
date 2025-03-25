const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(":memory:");

const initializeTables = () => {
  // Create tables
  db.serialize(() => {
    db.run("CREATE TABLE lists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
    db.run(
      "CREATE TABLE tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, dueDate TEXT, completed BOOLEAN, lockedBy INTEGER, lockExpiration INTEGER, listId INTEGER)",
    );
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT)");
    db.run(
      "CREATE TABLE taskAssignments (taskId INTEGER, userId INTEGER, PRIMARY KEY (taskId, userId))",
    );
    db.run("CREATE TABLE listUsers (listId INTEGER, userId INTEGER, PRIMARY KEY (listId, userId))");
  });
};

const initializeTestData = () => {
  // Insert test data
  db.serialize(() => {
    db.run("INSERT INTO users (username) VALUES ('user1')");
    db.run("INSERT INTO users (username) VALUES ('user2')");
    db.run("INSERT INTO users (username) VALUES ('user3')");
    db.run("INSERT INTO lists (name) VALUES ('List 1')");
    db.run("INSERT INTO lists (name) VALUES ('List 2')");
    db.run("INSERT INTO listUsers (listId, userId) VALUES (1, 1)");
    db.run("INSERT INTO listUsers (listId, userId) VALUES (1, 2)");
    db.run("INSERT INTO listUsers (listId, userId) VALUES (2, 2)");
    db.run(
      "INSERT INTO tasks (title, dueDate, completed, lockedBy, lockExpiration, listId) VALUES ('Task 1', '2023-12-31', 0, NULL, NULL, 1)",
    );
    db.run(
      "INSERT INTO tasks (title, dueDate, completed, lockedBy, lockExpiration, listId) VALUES ('Task 2', '2023-12-31', 0, NULL, NULL, 1)",
    );
    db.run(
      "INSERT INTO tasks (title, dueDate, completed, lockedBy, lockExpiration, listId) VALUES ('Task 3', '2023-12-31', 0, NULL, NULL, 2)",
    );
    db.run("INSERT INTO taskAssignments (taskId, userId) VALUES (1, 1)");
    db.run("INSERT INTO taskAssignments (taskId, userId) VALUES (2, 2)");
    db.run("INSERT INTO taskAssignments (taskId, userId) VALUES (3, 2)");
  });
};

module.exports = { db, initializeTables, initializeTestData };
