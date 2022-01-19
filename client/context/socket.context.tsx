import { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
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

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
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

    /**
     * put listeners in useEffect, so that we don't create listeners per page render
     * source:
     * - https://dev.to/bravemaster619/how-to-use-socket-io-client-correctly-in-react-app-o65
     * - https://dev.to/bravemaster619/how-to-prevent-multiple-socket-connections-and-events-in-react-531d
     */
    socket.on(EVENTS.SERVER.room, (value: Record<string, Room>) => {
      console.log("Received event for rooms");

      setRooms(value);
    });

    socket.on(EVENTS.SERVER.joined_room, (roomId: string) => {
      console.log(`Received event for joined_room with room id ${roomId}`);

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

    return () => {
      socket.off(EVENTS.SERVER.room);
      socket.off(EVENTS.SERVER.joined_room);
      socket.off(EVENTS.SERVER.room_message);
    };
  }, []);

  return (
    <SocketContext.Provider value={{socket, username, setUsername, roomId, rooms, messages, setMessages}} {...props} />
  );
}

export const useSocket = () => useContext(SocketContext);

export default SocketProvider;
