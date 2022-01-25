import { deserialize, deserializeArray } from "class-transformer";
import { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import EVENTS from "../config/events";

class MessageDetail {
  public message = "";
  public username = "";
  public time = ""
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
      setRooms(value);
    });

    socket.on(EVENTS.SERVER.joined_room, (roomId: string, messagesString: string) => {
      console.log(`Received event for joined_room with room id ${roomId}`);

      setRoomId(roomId);

      const messages = deserializeArray(MessageDetail, messagesString);
      setMessages(messages);
    });

    socket.on(EVENTS.SERVER.room_message, (messageDetailStr: string) => {
      if(!document.hasFocus()) {
        document.title = "New message...";
      }

      const messageDetail = deserialize(MessageDetail, messageDetailStr);
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
  }, [messages]);

  return (
    <SocketContext.Provider value={{socket, username, setUsername, roomId, rooms, messages, setMessages}} {...props} />
  );
}

export const useSocket = () => useContext(SocketContext);

export default SocketProvider;
