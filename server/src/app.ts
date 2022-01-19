import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import config from 'config';
import logger from './utils/logger';

import socket from "./socket";

const port = config.get<number>("port");
const host = config.get<number>("host");
const corsOrigin = config.get<string>("corsOrigin");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true
  },
  transports: ["websocket"]
});

app.get("/", (_, response) => {
  response.send("Server is up");
});

httpServer.listen(port, host, () => {
  logger.info(`🚀 Server is listening at port ${port}`);
  socket({io});
});
