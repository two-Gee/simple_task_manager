const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const tasksRouter = require("./api/routes.js");
const cors = require("cors");

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

app.use("/api", tasksRouter);

// WebSocket connection
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("joinList", (listId) => {
    socket.join(listId);
    console.log(`Client joined list ${listId}`);
  });

  socket.on("leaveList", (listId) => {
    socket.leave(listId);
    console.log(`Client left list ${listId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
