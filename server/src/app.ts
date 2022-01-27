import Redis from 'ioredis';
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import config from 'config';
import logger from './utils/logger';
import socket from "./socket";
import mongoose from "mongoose";
import { createAdapter } from '@socket.io/redis-adapter';

mongoose.connect(
  `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@socketio-chat-app.0deyc.mongodb.net/${process.env.COLLECTION_NAME}?retryWrites=true&w=majority`,
  () => {
    logger.info("Connected to database");
  }
);

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

const pubClient = new Redis(6379, "redis");
const subClient = pubClient.duplicate();

app.get("/", (_, response) => {
  response.send("Server is up");
});

httpServer.listen(port, host, () => {
  logger.info(`🚀 Server is listening at port ${port}`);
  io.adapter(createAdapter(pubClient, subClient));
  socket(io);
});
