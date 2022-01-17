import { nanoid } from "nanoid";
import {Server, Socket} from "socket.io";
import logger from "./utils/logger";

const EVENTS = {
  connection: "connection",
  CLIENT: {
    create_room: "create_room",
    send_message: "send_message"
  },
  SERVER: {
    room: "room",
    joined_room: "joined_room",
    room_message: "room_message"
  }
};

type Room = {
  name: string;
  messages: string[];
}
const rooms: Record<string, Room> = {};

function socket({io}: {io: Server}) {
  logger.info("Socket enabled");

  io.on(EVENTS.connection, (socket: Socket) => {
    logger.info(`User connected with id ${socket.id}`);

    socket.on(EVENTS.CLIENT.create_room, ({roomName}) => {
      logger.info(`Room created with name ${roomName}`);

      const roomId = nanoid();

      rooms[roomId] = {name: roomName, messages: []};
      logger.info(rooms);

      socket.join(roomId);

      socket.broadcast.emit(EVENTS.SERVER.room, rooms);

      socket.emit(EVENTS.SERVER.room, rooms);

      socket.emit(EVENTS.SERVER.joined_room, roomId);
    });

    socket.on(EVENTS.CLIENT.send_message, ({roomId, message, username}) => {
      const date = new Date();
      socket.to(roomId).emit(EVENTS.SERVER.room_message, {
        message,
        username,
        time: `${date.getHours()}:${date.getMinutes()}`
      });
    });
  });
}

export default socket;
