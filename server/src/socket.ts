import { nanoid } from "nanoid";
import {Server, Socket} from "socket.io";
import Room from "./types/Room";
import logger from "./utils/logger";
import RoomSchema from "./models/RoomSchema";
import MessageDetail from "./types/MessageDetail";
import { serialize } from "class-transformer";
import { backOff } from "exponential-backoff";

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

function emitToAll(socket: Socket, eventName: string, ...args: unknown[]): void {
  socket.broadcast.emit(eventName, ...args);

  socket.emit(eventName, ...args);
}

async function joinRoom(socket: Socket, roomId: string, previousRoomId?: string) {
  if(previousRoomId) {
    socket.leave(previousRoomId);
  }
  socket.join(roomId);

  const room = await RoomSchema.findOne({roomId}, {messages: 1});
  if(!room) {
    return;
  }
  const messages = room.messages;
  socket.emit(EVENTS.SERVER.joined_room, roomId, serialize(messages));
  logger.info(`user ${socket.id} joins room ${roomId}`);
}

async function getRooms(): Promise<Record<string, Room>> {
  return backOff(async () => {
    logger.info(`Getting rooms with collection name ${process.env.COLLECTION_NAME}...`);
    const rooms = await RoomSchema.find({}, {messages: 0});
    logger.info(`Finished getting rooms`);

    const record: Record<string, Room> = {};
    for(const room of rooms) {
      record[room.roomId] = {roomId: room.roomId, name: room.name, messages: []};
    }
    logger.info(`record = ${serialize(record)}`);
    return Promise.resolve(record);
  }, {
    numOfAttempts: 20
  });
}

function socket(io: Server) {
  logger.info("Socket enabled");

  /**
   * when user is connected, user is connected only to 1 of many servers
   * therefore, it is important to store the room and messages in MongoDB
   * also, when broadcast, we use Redis adapter
   */
  io.on(EVENTS.connection, (socket: Socket) => {
    logger.info(`User connected with id ${socket.id}`);

    getRooms()
      .then(rooms => {
        socket.emit(EVENTS.SERVER.room, rooms);
      })
      .catch((reason: string) => {
        logger.info(`Failed to query list of rooms because of ${reason}`);
      });

    socket.on(EVENTS.disconnect, (reason) => {
      logger.info(`User disconnected because of ${reason}`);
    });

    socket.on(EVENTS.CLIENT.create_room, ({roomName, previousRoomId}) => {
      logger.info(`Creating room with name ${roomName}...`);

      const roomId = nanoid();
      const newRoom: Room = {roomId, name: roomName, messages: []};
      RoomSchema.build(newRoom).save()
        .then(() => getRooms())
        .then(rooms => {
          emitToAll(socket, EVENTS.SERVER.room, rooms);
          joinRoom(socket, roomId, previousRoomId);
          logger.info(`Room created with name ${roomName}`);
        });
    });

    socket.on(EVENTS.CLIENT.send_message, ({roomId, message, username}) => {
      const date = new Date();
      RoomSchema.findOne({roomId})
        .then(room => {
          if(!room) {
            return;
          }

          const newMessage: MessageDetail = {
            message,
            username,
            time: `${date.getHours()}:${date.getMinutes()}`
          };
          RoomSchema.updateOne({roomId}, {messages: [...room.messages, newMessage]})
            .then(() => {
              socket.to(roomId).emit(EVENTS.SERVER.room_message, serialize(newMessage));
            });
        });
    });

    socket.on(EVENTS.CLIENT.join_room, (roomId: string, previousRoomId: string) => {
      joinRoom(socket, roomId, previousRoomId);
    });
  });
}

export default socket;
