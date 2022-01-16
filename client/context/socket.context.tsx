import { createContext, useContext } from "react";
import io from "socket.io-client";
import { SOCKET_URL } from "../config/default";

const SocketContext = createContext({});

function SocketsProvider(props: any): JSX.Element {
  return (
    <SocketContext.Provider value={{}}>
      {...props}
    </SocketContext.Provider>
  );
}

export const useSockets = () => useContext(SocketContext);

export default SocketsProvider;
