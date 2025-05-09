const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const routes = require("./api/index.js");
const cors = require("cors");
const { db } = require("./initializeDatabase");
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api", routes);
const connectedUsers = {};

// WebSocket connection
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("registerUser", (userId) => {
    console.log("user "+userId+" registered: " + socket.id);
    connectedUsers[socket.id] = userId;
  });

  socket.on("joinList", (listId) => {
    socket.join(listId);
    console.log(`Client joined list ${listId}`);
  });

  socket.on("leaveList", (listId) => {
    socket.leave(listId);
    console.log(`Client left list ${listId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    const userId = connectedUsers[socket.id];
    console.log(userId + " disconnected")
    if (userId) {
      // Unlock tasks for this user
      db.all(
        "SELECT id, listId FROM tasks WHERE lockedBy = ?",
        [userId],
        (err, rows) => {
          if (!err && rows.length > 0) {
            rows.forEach((task) => {
              db.run(
                "UPDATE tasks SET lockedBy = NULL, lockExpiration = NULL WHERE id = ?",
                [task.id]
              );
              io.to(task.listId).emit("taskUnlocked", {
                taskId: task.id,
              });
            });
          }
        }
      );
      delete connectedUsers[socket.id];
    }
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
