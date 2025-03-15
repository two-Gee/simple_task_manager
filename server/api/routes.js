const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const {db, initializeTables, initializeTestData} = require('./../initializeDatabase.js');

// Initialize database
initializeTables();
initializeTestData();

// Middleware to check if user is part of the list
const checkUserInList = (req, res, next) => {
  const { user_id } = req.body;
  const list_id = req.params.id || req.body.list_id;
  db.get("SELECT * FROM list_users WHERE list_id = ? AND user_id = ?", [list_id, user_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(403).json({ message: 'User not authorized for this list' });
    }
    next();
  });
};

// Create a new list
router.post('/lists', (req, res) => {
  const name = req.body.name;
  const user_id = req.body.user_id;
  console.log("creating list: " + name + " for user: " + user_id);
  db.run("INSERT INTO lists (name) VALUES (?)", [name], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const newList = { id: this.lastID, name: name };
    db.run("INSERT INTO list_users (list_id, user_id) VALUES (?, ?)", [newList.id, user_id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(newList);
    });
  });
});

// Get all lists
router.get('/lists', (req, res) => {
    const user_id  = req.query.user_id;
    console.log("getting lists for user: " + user_id);
    db.all("SELECT lists.* FROM lists JOIN list_users ON lists.id = list_users.list_id WHERE list_users.user_id = ?", [user_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Assign a user to a list
router.post('/lists/:id/users', (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  db.run("INSERT INTO list_users (list_id, user_id) VALUES (?, ?)", [id, user_id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    req.io.to(id).emit('userAssignedToList', { list_id: id, user_id });
    res.status(201).json({ list_id: id, user_id });
  });
});

// Create a new task
router.post('/tasks', checkUserInList, (req, res) => {
  const { title, due_date, assigned_to, list_id, user_id } = req.body;
  db.run("INSERT INTO tasks (title, due_date, completed, locked_by, lock_expiration, list_id) VALUES (?, ?, ?, ?, ?, ?)", [title, due_date, false, null, null, list_id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const newTask = { id: this.lastID, title, due_date, completed: false, locked_by: null, lock_expiration: null, list_id };
    assigned_to.forEach(user_id => {
      db.run("INSERT INTO task_assignments (task_id, user_id, add_counter, remove_counter) VALUES (?, ?, ?, ?)", [this.lastID, user_id, 1, 0]);
    });
    req.io.to(list_id).emit('taskAdded', newTask);
    res.status(201).json(newTask);
  });
});

// Get all tasks
router.get('/tasks', (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get all tasks for a list
router.get('/lists/:id/tasks', checkUserInList, (req, res) => {
  const { id } = req.params;
  db.all("SELECT * FROM tasks WHERE list_id = ?", [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Update a task
router.put('/tasks/:id', checkUserInList, (req, res) => {
  const { id } = req.params;
  const { title, due_date, completed, locked_by, lock_expiration, list_id } = req.body;
  db.run("UPDATE tasks SET title = ?, due_date = ?, completed = ?, locked_by = ?, lock_expiration = ?, list_id = ? WHERE id = ?", [title, due_date, completed, locked_by, lock_expiration, list_id, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const updatedTask = { id, title, due_date, completed, locked_by, lock_expiration, list_id };
    req.io.to(list_id).emit('taskUpdated', updatedTask);
    res.json(updatedTask);
  });
});

// Delete a task
router.delete('/tasks/:id', checkUserInList, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tasks WHERE id = ?", id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    req.io.emit('taskDeleted', id);
    res.status(204).end();
  });
});

// Mark a task as completed
router.post('/tasks/:id/complete', checkUserInList, (req, res) => {
  const { id } = req.params;
  db.run("UPDATE tasks SET completed = ? WHERE id = ?", [true, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    req.io.emit('taskCompleted', { task_id: id });
    res.json({ task_id: id });
  });
});

// Assign a task to a user
router.post('/tasks/:id/assign', checkUserInList, (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  db.run("INSERT INTO task_assignments (task_id, user_id, add_counter, remove_counter) VALUES (?, ?, ?, ?)", [id, user_id, 1, 0], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    req.io.emit('taskAssigned', { task_id: id, user_id });
    res.status(201).json({ task_id: id, user_id });
  });
});

// Lock a task for editing
router.post('/tasks/:id/lock', checkUserInList, (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  const lock_expiration = Date.now() + 300000; // 5 minutes lock
  db.run("UPDATE tasks SET locked_by = ?, lock_expiration = ? WHERE id = ?", [user_id, lock_expiration, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    req.io.emit('taskLocked', { task_id: id, user_id, lock_expiration });
    res.json({ task_id: id, user_id, lock_expiration });
  });
});

// Unlock a task
router.post('/tasks/:id/unlock', checkUserInList, (req, res) => {
  const { id } = req.params;
  db.run("UPDATE tasks SET locked_by = ?, lock_expiration = ? WHERE id = ?", [null, null, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    req.io.emit('taskUnlocked', { task_id: id });
    res.json({ task_id: id });
  });
});

// User login
router.post('/user/login', (req, res) => {
  const { username } = req.body;
  console.log("logging in user: " + username);
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.status(200).json(row);
    } else {
      res.status(401).json({ message: 'Invalid username' });
    }
  });
});

// User login
router.post('/user/validate', (req, res) => {
    const { id } = req.body;
    console.log("validating user: " + id);
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.status(200).json(row);
        } else {
            res.status(401).json({ message: 'Invalid user' });
        }
    });
  });

module.exports = router;