import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { createClient } from 'redis';

//redis settings
const redis = createClient({
    socket: {
      host: 'redis',
      port: 6379,
    }
});

redis.on('error', (err) => console.log('Redis Client Error', err));

await redis.connect();

//connection parameters and server creation
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

//sockets functions
//On connect, logs and maps the user to a socket
io.on("connect", (socket) => {
  socket.on("login", async (user) => {
    await redis.hSet("online_users", user, socket.id);
    const users = await redis.hGetAll("online_users");
    console.log("Client connected: ", users);
    io.emit("online_users", users);
  });

  //checks if a message is sent to someone else
  socket.on("msg_sent", async ({sender, receiver, msg}) => {
    const receiverSock = await redis.hGet("online_users", receiver);
    if (receiverSock)
    {
      io.to(receiverSock).emit("received", {
        sender,
        receiver,
        msg
      });
    }
  })

  socket.on("new_conv", async ({sender, receiver}) => {
    const receiverSock = await redis.hGet("online_users", receiver);
    if (receiverSock)
    {
      io.to(receiverSock).emit("add_conv");
    }
  })

  socket.on("friend_request", async ({user, oUser}) => {
    const receiverSock = await redis.hGet("online_users", oUser);
    if (receiverSock)
    {
      io.to(receiverSock).emit("request", {
        user,
        oUser
      });
    }
  })

  socket.on("friend_added", async ({user, friend}) => {
    const receiverSock = await redis.hGet("online_users", friend);
    if (receiverSock)
    {
      io.to(receiverSock).emit("adding", {
        user,
        friend
      });
    }
    io.to(socket.id).emit("adding", {
      user,
      friend
    });
  })

  socket.on("friend_denied", async ({user, friend}) => {
    const receiverSock = await redis.hGet("online_users", friend);
    if (receiverSock)
    {
      io.to(receiverSock).emit("refusing", {
        user,
        friend
      });
    }
  })

  socket.on("friend_or_user_blocked", async ({user, oUser}) => {
    const receiverSock = await redis.hGet("online_users", oUser);
    if (receiverSock)
    {
      io.to(receiverSock).emit("blocked", {
        user,
        oUser
      });
    }
  })

  socket.on("blocking_friend_or_user", async () => {
    io.to(socket.id).emit("blocking");
  })

  socket.on("user_unblocked", async ({user, oUser}) => {
    const receiverSock = await redis.hGet("online_users", oUser);
    if (receiverSock)
    {
      io.to(receiverSock).emit("unblocking", {
        user,
        oUser
      });
    }
    io.to(socket.id).emit("unblocking", {
      user,
      oUser
    })
  })

  socket.on("challenge_sent", async ({sender, receiver}) => {
    const receiverSock = await redis.hGet("online_users", receiver);
    if (receiverSock)
    {
      io.to(receiverSock).emit("challenge", {
        sender,
        receiver
      });
    }
    io.to(socket.id).emit("challenge", {
      sender,
      receiver
    });
  })

  socket.on("typing", async ({sender, receiver}) => {
    const receiverSock = await redis.hGet("online_users", receiver);
    if (receiverSock)
    {
      io.to(receiverSock).emit("isTyping", {
        sender,
        receiver
      });
    }
  })

  socket.on("notTyping", async ({sender, receiver}) => {
    const receiverSock = await redis.hGet("online_users", receiver);
    if (receiverSock)
    {
      io.to(receiverSock).emit("isNotTyping", {
        sender,
        receiver
      });
    }
  })

  socket.on("duel_accepted", async ({user, oUser}) => {
    const receiverSock = await redis.hGet("online_users", oUser);
    if (receiverSock)
    {
      io.to(receiverSock).emit("accept", {
        user,
        oUser
      });
    }
  })

  socket.on("duel_refused", async ({user, oUser}) => {
    const receiverSock = await redis.hGet("online_users", oUser);
    if (receiverSock)
    {
      io.to(receiverSock).emit("refuse", {
        user,
        oUser
      });
    }
  })

  //delete the user's socket if he's disconnected
  socket.on("disconnect", async () => {
    const onlineUsers = await redis.hGetAll("online_users");
    const fieldToDelete = Object.keys(onlineUsers).find(
      key => onlineUsers[key] === socket.id
    );
    if (fieldToDelete)
      await redis.hDel("online_users", fieldToDelete);
    const users = await redis.hGetAll("online_users");
    console.log("Client disconnected: ", users);
    io.emit("online_users", users);
  });
});

//errors check and set the listening port
httpServer
  .once("error", (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
