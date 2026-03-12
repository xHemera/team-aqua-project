import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { createClient } from 'redis';

const redis = createClient({
    url: 'redis://redis:6379',
});

redis.on('error', (err) => console.log('Redis Client Error', err));

await redis.connect();



//parametres de connexion + creation de serveur
const hostname = "0.0.0.0";
const port = 4000;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  },
  transports: ["websocket", "polling"],
});

//fonctions sockets (comme gerer les connexions ou l'envoi de msgs)
io.on("connect", (socket) => {
  socket.on("login", async (user) => {
    await redis.hSet("online_users", socket.id, JSON.stringify(user));
    const users = await redis.hGetAll("online_users");
    console.log("Client connected: ", users);
    socket.emit("online_users: ", users);
  });
  socket.on("disconnect", async () => {
    await redis.hDel("online_users", socket.id)
    const users = await redis.hGetAll("online_users");
    console.log("Client disconnected: ", users);
    });
  })

//check d'erreur et ecoute du port
httpServer
  .once("error", (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });