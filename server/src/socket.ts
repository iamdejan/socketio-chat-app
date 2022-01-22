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
  messages: string[];
}
const rooms: Record<string, Room> = {}; // TODO dejan (MongoDB): store in MongoDB

function emitToAll(socket: Socket, eventName: string, ...args: any[]): void {
  //TODO dejan: use Redis pub-sub to broadcast to all clients
  // who joined the same room but scattered across servers
  socket.broadcast.emit(eventName, ...args);
  socket.emit(eventName, ...args);
}

function joinRoom(socket: Socket, roomId: string, previousRoomId?: string) {
  if(previousRoomId) {
    socket.leave(previousRoomId);
  }
  socket.join(roomId);

  // TODO dejan (MongoDB): retrieve from MongoDB
  socket.emit(EVENTS.SERVER.joined_room, roomId);
  logger.info(`user ${socket.id} joins room ${roomId}`);
}

function socket(io: Server) {
  logger.info("Socket enabled");

  /**
   * when user is connected, user is connected only to 1 of many servers
   * therefore, it is important to store the room and messages in MongoDB
   * also, when broadcast, broadcast to all servers using Redis pub-sub
   */ 
  io.on(EVENTS.connection, (socket: Socket) => {
    logger.info(`User connected with id ${socket.id}`);

    // TODO dejan (MongoDB): get list of rooms from MongoDB
    socket.emit(EVENTS.SERVER.room, rooms);

    socket.on(EVENTS.disconnect, (reason) => {
      logger.info(`User disconnected because of ${reason}`);
    });

    socket.on(EVENTS.CLIENT.create_room, ({roomName, previousRoomId}) => {
      logger.info(`Room created with name ${roomName}`);

      const roomId = nanoid();
      rooms[roomId] = {name: roomName, messages: []};

      emitToAll(socket, EVENTS.SERVER.room, rooms);

      joinRoom(socket, roomId, previousRoomId);
    });

    socket.on(EVENTS.CLIENT.send_message, ({roomId, message, username}) => {
      const date = new Date();
      // TODO dejan (MongoDB): store message in MongoDB
      socket.to(roomId).emit(EVENTS.SERVER.room_message, {
        message,
        username,
        time: `${date.getHours()}:${date.getMinutes()}`
      });
    });

    socket.on(EVENTS.CLIENT.join_room, (roomId: string, previousRoomId: string) => {
      joinRoom(socket, roomId, previousRoomId);
    });
  });
}

export default socket;
