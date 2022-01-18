import { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from "../config/default";
import EVENTS from "../config/events";

type MessageDetail = {
  message: string;
  username: string;
  time: string
}

type Room = {
  name: string;
}

interface Context {
  socket: Socket;
  username?: string;
  setUsername: (username: string) => void;
  roomId?: string;
  rooms: Record<string, Room>;
  messages: MessageDetail[];
  setMessages: (messages: MessageDetail[]) => void;
}

console.log(`SOCKET_URL=${SOCKET_URL}`);
const socket = io(SOCKET_URL, {
  transports: ["websocket"]
});

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
  const [rooms, setRooms] = useState<Record<string, Room>>({});
  const [messages, setMessages] = useState<MessageDetail[]>([]);

  useEffect(() => {
    window.onfocus = function() {
      document.title = "Chat app";
    }
  }, []);

  socket.on(EVENTS.SERVER.room, (value: Record<string, Room>) => {
    setRooms(value);
  });

  socket.on(EVENTS.SERVER.joined_room, (roomId: string) => {
    setRoomId(roomId);
    setMessages([]);
  });

  socket.on(EVENTS.SERVER.room_message, (messageDetail: MessageDetail) => {
    if(!document.hasFocus()) {
      document.title = "New message...";
    }

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
