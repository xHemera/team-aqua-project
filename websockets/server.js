import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";

const hostname = "0.0.0.0";
const port = 4000;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  },
  transports: ["websocket", "polling"]
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", reason);
  });
});

httpServer
  .once("error", (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });