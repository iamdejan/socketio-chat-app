import { createContext, useContext, useState } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from "../config/default";

interface Context {
  socket: Socket;
  username?: string;
  setUsername: (username: string) => void;
}

const socket = io(SOCKET_URL);

const SocketContext = createContext<Context>({
  socket,
  setUsername: () => {}
});

function SocketProvider(props: any): JSX.Element {
  const [username, setUsername] = useState("");

  return (
    <SocketContext.Provider value={{socket, username, setUsername}} {...props} />
  );
}

export const useSocket = () => useContext(SocketContext);

export default SocketProvider;
