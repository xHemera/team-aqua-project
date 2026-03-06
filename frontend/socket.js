"use client";

import { io } from "socket.io-client";

//connexion avec le serveur de websockets
export const socket = io("http://localhost:4000", {
  transports: ["websocket", "polling"],
  autoConnect: true,
  reconnection: true
});