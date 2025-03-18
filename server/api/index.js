const express = require("express");
const router = express.Router();
const { db, initializeTables, initializeTestData } = require("../initializeDatabase.js");
const listsRouter = require("./routes/lists.js");
const tasksRouter = require("./routes/tasks.js");
const userRouter = require("./routes/user.js");

// Initialize database
initializeTables();
initializeTestData();

// Routes
router.use("/lists", listsRouter);
router.use("/lists", tasksRouter);
router.use("/user", userRouter);

module.exports = router;
