import React, { createContext, useContext, useMemo, useState } from 'react';
import { Socket, io } from 'socket.io-client';

interface SocketContextProps {
  socket: Socket | null;
}
interface SocketProviderProps {
  children: React.ReactNode;
}


const SocketContext = createContext<SocketContextProps>({ socket: null });

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  useMemo(() => {
    const newSocket = io('http://127.0.0.1:5000');

    newSocket.on('connect', () => {
      setSocket(newSocket);
      setLoading(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);

  if (!socket) {
    throw new Error('Socket context not found');
  }

  return socket;
};
