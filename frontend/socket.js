"use client";

import { io } from "socket.io-client";

//connects the socket to the server and sets some options

const url = process.env.NEXT_PUBLIC_SOCKET ?? "http://localhost:4001";
console.log(JSON.stringify(url));

export const socket = io(url.trim(), {
  autoConnect: false,
  reconnection: true,
});