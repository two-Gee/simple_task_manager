const express = require("express");
const router = express.Router();
const { db } = require("../../initializeDatabase");

// User login
router.post("/login", (req, res) => {
  const { username } = req.body;
  console.log("logging in user: " + username);
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      res.status(200).json(row);
    } else {
      res.status(400).json({ message: "Invalid username" });
    }
  });
});

// Create new user
router.post("/register", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username required" });
  }

  db.get("SELECT id FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (row) {
      return res.status(409).json({ message: "User already exists" });
    }

    db.run("INSERT INTO users (username) VALUES (?)", [username], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Return newly created user
      const newUserId = this.lastID;
      res.status(201).json({ id: newUserId, username });
    });
  });
});

// Validate user
router.post("/validate", (req, res) => {
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
