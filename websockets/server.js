import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";


//parametres de connexion + creation de serveur
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

const online = new Map();

//fonctions sockets (comme gerer les connexions ou l'envoi de msgs)
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("user:login", ({ userId }) =>  {
    online.set(userId, socket.id);
    console.log("User online:", userId);
  })
  socket.on("disconnect", () => {
    for (const [userId, id] of online.entries()) {
      if (id === socket.id) {
        online.delete(userId);
        console.log("Client disconnected:", userId);
      }
    }
  });
});

//check d'erreur et ecoute du port
httpServer
  .once("error", (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });