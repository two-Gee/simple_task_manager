const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const {
  db,
  initializeTables,
  initializeTestData,
} = require("./../initializeDatabase.js");

// Initialize database
initializeTables();
initializeTestData();

// Middleware to check if user is part of the list
const checkUserInList = (req, res, next) => {
  const userId = req.headers["userid"];
  const listId = req.params.listId;

  db.get(
    "SELECT * FROM listUsers WHERE listId = ? AND userId = ?",
    [listId, userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res
          .status(403)
          .json({ message: "User not authorized for this list" });
      }
      next();
    }
  );
};

// Create a new list
router.post("/lists", (req, res) => {
  const { name, userId } = req.body;
  db.run("INSERT INTO lists (name) VALUES (?)", [name], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const newList = { id: this.lastID, name };
    db.run(
      "INSERT INTO listUsers (listId, userId) VALUES (?, ?)",
      [newList.id, userId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(newList);
      }
    );
  });
});

// Get all lists
router.get("/lists", (req, res) => {
  const userId = req.query.userId;
  db.all(
    "SELECT lists.* FROM lists JOIN listUsers ON lists.id = listUsers.listId WHERE listUsers.userId = ?",
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Assign a user to a list
router.post("/lists/:listId/users", (req, res) => {
  const { listId } = req.params;
  const { assignedUserName } = req.body;
  db.get(
    "SELECT id FROM users WHERE username = ?",
    [assignedUserName],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ message: "User not found" });
      }
      const assignedUserId = row.id;
      // Check if user is already assigned
      db.get(
        "SELECT * FROM listUsers WHERE listId = ? AND userId = ?",
        [listId, assignedUserId],
        (err, row) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          if (row) {
            return res
              .status(409)
              .json({ message: "User already assigned to list" });
          }
          db.run(
            "INSERT INTO listUsers (listId, userId) VALUES (?, ?)",
            [listId, assignedUserId],
            function (err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              req.io
                .to(listId)
                .emit("userAssignedToList", { listId: listId, assignedUserId });
              res.status(201).json({ listId: listId, assignedUserId });
            }
          );
        }
      );
    }
  );
});

// Create a new task
router.post("/lists/:listId/tasks", checkUserInList, (req, res) => {
  const { listId } = req.params;
  const { title, dueDate } = req.body;
  db.run(
    "INSERT INTO tasks (title, dueDate, completed, lockedBy, lockExpiration, listId) VALUES (?, ?, ?, ?, ?, ?)",
    [title, dueDate, false, null, null, listId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const newTask = {
        id: this.lastID,
        title,
        dueDate,
        completed: false,
        lockedBy: null,
        lockExpiration: null,
        listId,
      };
      // assignedTo.forEach(userId => {
      //     db.run("INSERT INTO taskAssignments (taskId, userId, addCounter, removeCounter) VALUES (?, ?, ?, ?)", [this.lastID, userId, 1, 0]);
      // });
      req.io.to(listId).emit("taskAdded", newTask);
      res.status(201).json(newTask);
    }
  );
});

// Get all tasks for a list along with assigned users
router.get("/lists/:listId/tasks", checkUserInList, (req, res) => {
  const listId = req.params.listId;
  db.all("SELECT * FROM tasks WHERE listId = ?", [listId], (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const taskIds = tasks.map((task) => task.id);
    if (taskIds.length === 0) {
      return res.json(tasks);
    }
    db.all(
      `SELECT ta.taskId, u.username FROM taskAssignments ta JOIN users u ON ta.userId = u.id WHERE ta.taskId IN (${taskIds.join(
        ","
      )})`,
      [],
      (err, assignments) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        const tasksWithUsers = tasks.map((task) => {
          task.assignedUsers = assignments
            .filter((assignment) => assignment.taskId === task.id)
            .map((assignment) => assignment.username);
          return task;
        });
        res.json(tasksWithUsers);
      }
    );
  });
});

// Update a task
router.put("/lists/:listId/tasks/:id", checkUserInList, (req, res) => {
  const { id, listId } = req.params;
  const { title, dueDate, completed, lockedBy, lockExpiration } = req.body;
  db.run(
    "UPDATE tasks SET title = ?, dueDate = ?, completed = ?, lockedBy = ?, lockExpiration = ?, listId = ? WHERE id = ?",
    [title, dueDate, completed, lockedBy, lockExpiration, listId, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const updatedTask = {
        id,
        title,
        dueDate,
        completed,
        lockedBy,
        lockExpiration,
        listId,
      };
      req.io.to(listId).emit("taskUpdated", updatedTask);
      res.json(updatedTask);
    }
  );
});

// Delete a task
router.delete("/lists/:listId/tasks/:id", checkUserInList, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tasks WHERE id = ?", id, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    req.io.emit("taskDeleted", id);
    res.status(204).end();
  });
});

// Mark a task as completed
router.post(
  "/lists/:listId/tasks/:id/complete",
  checkUserInList,
  (req, res) => {
    const { id, listId } = req.params;

    // Fetch the current completed status
    db.get("SELECT completed FROM tasks WHERE id = ?", [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const newCompletedStatus = !row.completed;

      // Update the completed status to the opposite
      db.run(
        "UPDATE tasks SET completed = ? WHERE id = ?",
        [newCompletedStatus, id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          req.io.to(listId).emit("taskCompleted", {
            taskId: id,
            completed: newCompletedStatus,
          });
          res.json({ taskId: id, completed: newCompletedStatus });
        }
      );
    });
  }
);

// Assign a task to a user
router.post("/lists/:listId/tasks/:id/assign", checkUserInList, (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  db.run(
    "INSERT INTO taskAssignments (taskId, userId, addCounter, removeCounter) VALUES (?, ?, ?, ?)",
    [id, userId, 1, 0],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      req.io.emit("taskAssigned", { taskId: id, userId });
      res.status(201).json({ taskId: id, userId });
    }
  );
});

// Lock a task for editing
router.post("/lists/:listId/tasks/:id/lock", checkUserInList, (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const lockExpiration = Date.now() + 300000; // 5 minutes lock
  db.run(
    "UPDATE tasks SET lockedBy = ?, lockExpiration = ? WHERE id = ?",
    [userId, lockExpiration, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      req.io.emit("taskLocked", { taskId: id, userId, lockExpiration });
      res.json({ taskId: id, userId, lockExpiration });
    }
  );
});

// Unlock a task
router.post("/lists/:listId/tasks/:id/unlock", checkUserInList, (req, res) => {
  const { id } = req.params;
  db.run(
    "UPDATE tasks SET lockedBy = ?, lockExpiration = ? WHERE id = ?",
    [null, null, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      req.io.emit("taskUnlocked", { taskId: id });
      res.json({ taskId: id });
    }
  );
});

// User login
router.post("/user/login", (req, res) => {
  const { username } = req.body;
  console.log("logging in user: " + username);
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.status(200).json(row);
    } else {
      res.status(401).json({ message: "Invalid username" });
    }
  });
});

// User login
router.post("/user/validate", (req, res) => {
  const { id } = req.body;
  console.log("validating user: " + id);
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.status(200).json(row);
    } else {
      res.status(401).json({ message: "Invalid user" });
    }
  });
});

module.exports = router;
