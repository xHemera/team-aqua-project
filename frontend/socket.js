"use client";

import { io } from "socket.io-client";

//connects the socket to the server and sets some options

const url = process.env.SOCKET ?? "http://localhost:4001";

export const socket = io(url, {
  transports: ["websocket", "polling"],
  autoConnect: false,
  reconnection: true
});