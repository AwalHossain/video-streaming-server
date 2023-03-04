import { createContext, useContext, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useMemo(() => {
    const newSocket = io('http://127.0.0.1:4000');

    newSocket.on('connect', () => {
      setSocket(newSocket);
      setLoading(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SocketContext.Provider value={socket}>
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
