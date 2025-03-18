const express = require("express");
const router = express.Router();
const { db } = require("../../initializeDatabase");
const checkUserInList = require("../middlewares/checkUserInList");

// Create a new task
router.post("/:listId/tasks/", checkUserInList, (req, res) => {
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
    },
  );
});

// Get all tasks for a list along with assigned users
router.get("/:listId/tasks/", checkUserInList, (req, res) => {
  const listId = req.params.listId;
  console.log("getting tasks for list: " + listId);
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
        ",",
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
      },
    );
  });
});

// Update a task
router.put("/:listId/tasks/:id", checkUserInList, (req, res) => {
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
    },
  );
});

// Delete a task
router.delete("/:listId/tasks/:id", checkUserInList, (req, res) => {
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
router.post("/:listId/tasks/:id/complete", checkUserInList, (req, res) => {
  const { id, listId } = req.params;

  // Fetch the current completed status
  db.get("SELECT completed FROM tasks WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const newCompletedStatus = !row.completed;

    // Update the completed status to the opposite
    db.run("UPDATE tasks SET completed = ? WHERE id = ?", [newCompletedStatus, id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      req.io.to(listId).emit("taskCompleted", {
        taskId: id,
        completed: newCompletedStatus,
      });
      res.json({ taskId: id, completed: newCompletedStatus });
    });
  });
});

// Assign a task to a user
router.post("/:listId/tasks/:id/assign", checkUserInList, (req, res) => {
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
    },
  );
});

// Lock a task for editing
router.post("/:listId/tasks/:id/lock", checkUserInList, (req, res) => {
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
    },
  );
});

// Unlock a task
router.post("/:listId/tasks/:id/unlock", checkUserInList, (req, res) => {
  const { id } = req.params;
  db.run("UPDATE tasks SET lockedBy = ?, lockExpiration = ? WHERE id = ?", [null, null, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    req.io.emit("taskUnlocked", { taskId: id });
    res.json({ taskId: id });
  });
});

module.exports = router;
