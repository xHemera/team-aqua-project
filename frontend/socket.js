"use client";

import { io } from "socket.io-client";

//connects the socket to the server and sets some options
export const socket = io("http://localhost:4001", {
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnection: true
});