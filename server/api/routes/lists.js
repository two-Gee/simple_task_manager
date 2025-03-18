// routes/lists.js
const express = require("express");
const router = express.Router();
const { db } = require("../../initializeDatabase");

// Create a new list
router.post("/", (req, res) => {
  const { name, userId } = req.body;
  db.run("INSERT INTO lists (name) VALUES (?)", [name], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const newList = { id: this.lastID, name };
    db.run("INSERT INTO listUsers (listId, userId) VALUES (?, ?)", [newList.id, userId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(newList);
    });
  });
});

// Get all lists for a user
router.get("/", (req, res) => {
  const userId = req.headers.userid;
  db.all(
    `SELECT lists.*, 
     (SELECT COUNT(*) > 1 FROM listUsers WHERE listId = lists.id) AS isShared 
     FROM lists 
     JOIN listUsers ON lists.id = listUsers.listId 
     WHERE listUsers.userId = ?
    `,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    },
  );
});

// Assign user to list
router.post("/:listId/users", (req, res) => {
  const { listId } = req.params;
  const { assignedUserName } = req.body;
  db.get("SELECT id FROM users WHERE username = ?", [assignedUserName], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }
    const assignedUserId = row.id;
    db.get("SELECT * FROM listUsers WHERE listId = ? AND userId = ?", [listId, assignedUserId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (row) {
        return res.status(409).json({ message: "User already assigned to list" });
      }
      db.run("INSERT INTO listUsers (listId, userId) VALUES (?, ?)", [listId, assignedUserId], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        db.get("SELECT name FROM lists WHERE id = ?", [listId], (err, row) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          const listName = row.name;
          req.io.to(String(assignedUserId)).emit("assignedToList", {
            id: listId,
            name: listName,
            isShared: true,
          });
          res.status(201).json({ listId, assignedUserId });
        });
      });
    });
  });
});

module.exports = router;
