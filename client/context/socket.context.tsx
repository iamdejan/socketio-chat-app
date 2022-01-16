import { createContext, useContext, useState } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from "../config/default";
import EVENTS from "../config/events";

interface Context {
  socket: Socket;
  username?: string;
  setUsername: (username: string) => void;
  roomId?: string;
  rooms: any[];
}

const socket = io(SOCKET_URL);

const SocketContext = createContext<Context>({
  socket,
  setUsername: () => {},
  rooms: []
});

function SocketProvider(props: any): JSX.Element {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState([]);

  socket.on(EVENTS.SERVER.room, (value) => {
    setRooms(value);
  });

  return (
    <SocketContext.Provider value={{socket, username, setUsername, roomId, rooms}} {...props} />
  );
}

export const useSocket = () => useContext(SocketContext);

export default SocketProvider;