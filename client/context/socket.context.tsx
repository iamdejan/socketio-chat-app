import { createContext, useContext, useState } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from "../config/default";
import EVENTS from "../config/events";

type MessageDetail = {
  message: string;
  username: string;
  time: string
}

interface Context {
  socket: Socket;
  username?: string;
  setUsername: (username: string) => void;
  roomId?: string;
  rooms: Record<string, any>;
  messages: MessageDetail[];
  setMessages: (messages: MessageDetail[]) => void;
}

const socket = io(SOCKET_URL);

const SocketContext = createContext<Context>({
  socket,
  setUsername: (_: string) => {},
  rooms: {},
  messages: [],
  setMessages: (_: MessageDetail[]) => {}
});

function SocketProvider(props: any): JSX.Element {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState<MessageDetail[]>([]);

  socket.on(EVENTS.SERVER.room, (value) => {
    setRooms(value);
  });

  socket.on(EVENTS.SERVER.joined_room, (roomId: string) => {
    setRoomId(roomId);
    setMessages([]);
  });

  socket.on(EVENTS.SERVER.room_message, (messageDetail: MessageDetail) => {
    setMessages([
      ...messages,
      messageDetail
    ]);
  });

  return (
    <SocketContext.Provider value={{socket, username, setUsername, roomId, rooms, messages, setMessages}} {...props} />
  );
}

export const useSocket = () => useContext(SocketContext);

export default SocketProvider;
