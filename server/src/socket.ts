import { nanoid } from "nanoid";
import {Server, Socket} from "socket.io";
import logger from "./utils/logger";

const EVENTS = {
  connection: "connection",
  CLIENT: {
    create_room: "create_room"
  },
  SERVER: {
    room: "room",
    joined_room: "joined_room"
  }
};

type Room = {
  name: string;
}
const rooms: Record<string, Room> = {};

function socket({io}: {io: Server}) {
  logger.info("Socket enabled");

  io.on(EVENTS.connection, (socket: Socket) => {
    logger.info(`User connected with id ${socket.id}`);

    socket.on(EVENTS.CLIENT.create_room, ({roomName}) => {
      logger.info(`Room created with name ${roomName}`);

      const roomId = nanoid();

      rooms[roomId] = {name: roomName};
      logger.info(rooms);

      socket.join(roomId);

      socket.broadcast.emit(EVENTS.SERVER.room, rooms);

      socket.emit(EVENTS.SERVER.room, rooms);

      socket.emit(EVENTS.SERVER.joined_room, roomId);
    });
  });
}

export default socket;
