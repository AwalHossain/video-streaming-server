import { createContext, useContext, useMemo } from "react";

import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => io("http://127.0.0.1:4000"), []);
  console.log("socket is connec", socket.id);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
