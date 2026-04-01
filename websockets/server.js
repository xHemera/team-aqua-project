import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { createClient } from 'redis';

const redis = createClient({
    socket: {
      host: 'redis',
      port: 6379,
      reconnectStrategy: retries => Math.min(retries * 50, 500)
    }
});

redis.on('error', (err) => console.log('Redis Client Error', err));

await redis.connect();

//parametres de connexion + creation de serveur
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 4001);

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
    await redis.hSet("online_users", user, socket.id);
    const users = await redis.hGetAll("online_users");
    console.log("Client connected: ", users);
    io.emit("online_users", users);
  });

  socket.on("msg_sent", async ({sender, receiver}) => {
    const receiverSock = await redis.hGet("online_users", receiver);
    if (receiverSock)
    {
      console.log(receiverSock, sender, receiver);
      io.to(receiverSock).emit("received", {
        sender,
        receiver
      });
    }
  })

  socket.on("disconnect", async () => {
    await redis.hDel("online_users", socket.id);
    const users = await redis.hGetAll("online_users");
    console.log("Client disconnected: ", users);
    io.emit("online_users", users);
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
