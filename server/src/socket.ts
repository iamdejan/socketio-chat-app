import { nanoid } from "nanoid";
import {Server, Socket} from "socket.io";
import Room from "./types/Room";
import logger from "./utils/logger";
import RoomSchema from "./models/RoomSchema";
import MessageDetail from "./types/MessageDetail";

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
  //TODO dejan (Redis): use Redis pub-sub to broadcast to all clients
  // who joined the same room but scattered across servers
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
  logger.info(`messages for room ${roomId} = ${JSON.stringify(messages)}`);
  socket.emit(EVENTS.SERVER.joined_room, roomId, messages);
  logger.info(`user ${socket.id} joins room ${roomId}`);
}

async function getRooms(): Promise<Record<string, Room>> {
  const rooms = await RoomSchema.find({}, {messages: 0});
  
  const record: Record<string, Room> = {};
  for(const room of rooms) {
    record[room.roomId] = {roomId: room.roomId, name: room.name, messages: []};
  }
  return Promise.resolve(record);
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

    getRooms().then(rooms => {
      socket.emit(EVENTS.SERVER.room, rooms);
    })

    socket.on(EVENTS.disconnect, (reason) => {
      logger.info(`User disconnected because of ${reason}`);
    });

    socket.on(EVENTS.CLIENT.create_room, ({roomName, previousRoomId}) => {
      logger.info(`Room created with name ${roomName}`);

      const roomId = nanoid();
      const newRoom: Room = {roomId, name: roomName, messages: []};
      RoomSchema.build(newRoom).save()
        .then(() => getRooms())
        .then(rooms => {
          emitToAll(socket, EVENTS.SERVER.room, rooms);
          joinRoom(socket, roomId, previousRoomId);
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
              socket.to(roomId).emit(EVENTS.SERVER.room_message, newMessage);
            });
        });
    });

    socket.on(EVENTS.CLIENT.join_room, (roomId: string, previousRoomId: string) => {
      joinRoom(socket, roomId, previousRoomId);
    });
  });
}

export default socket;
