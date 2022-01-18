import { nanoid } from "nanoid";
import {Server, Socket} from "socket.io";
import logger from "./utils/logger";

const EVENTS = {
  connection: "connection",
  disconnect: "disconnect",
  CLIENT: {
    create_room: "create_room",
    send_message: "send_message",
    join_room: "join_room"
  },
  SERVER: {
    room: "room",
    joined_room: "joined_room",
    room_message: "room_message"
  }
};

type Room = {
  name: string;
}
const rooms: Record<string, Room> = {};

function emitToAll(socket: Socket, eventName: string, ...args: any[]): void {
  socket.broadcast.emit(eventName, ...args);
  socket.emit(eventName, ...args);
}

function joinRoom(socket: Socket, roomId: string) {
  socket.join(roomId);
  socket.emit(EVENTS.SERVER.joined_room, roomId);
}

function socket({io}: {io: Server}) {
  logger.info("Socket enabled");

  io.on(EVENTS.connection, (socket: Socket) => {
    logger.info(`User connected with id ${socket.id}`);
    socket.emit(EVENTS.SERVER.room, rooms);

    socket.on(EVENTS.disconnect, (reason) => {
      logger.info(`User disconnected because of ${reason}`);
    });

    socket.on(EVENTS.CLIENT.create_room, ({roomName}) => {
      logger.info(`Room created with name ${roomName}`);

      const roomId = nanoid();

      rooms[roomId] = {name: roomName};
      logger.info(rooms);

      emitToAll(socket, EVENTS.SERVER.room, rooms);

      joinRoom(socket, roomId);
    });

    socket.on(EVENTS.CLIENT.send_message, ({roomId, message, username}) => {
      const date = new Date();
      socket.to(roomId).emit(EVENTS.SERVER.room_message, {
        message,
        username,
        time: `${date.getHours()}:${date.getMinutes()}`
      });
    });

    socket.on(EVENTS.CLIENT.join_room, (roomId: string) => {
      joinRoom(socket, roomId);
    });
  });
}

export default socket;
